import uuid
import time
from typing import Any

from app.agents.prompts import AGENT_PROMPTS, AGENT_TITLES
from app.models.schemas import AgentOutput, GenerateRequest, GenerateResponse, JudgeScores
from app.services.llm import generate_text, parse_judge_response
from app.services.rag import retrieve_context
from app.services.search import search_web

AGENT_SEQUENCE = ["idea", "architecture", "ui", "backend", "pitch", "judge"]


async def run_agent_pipeline(request: GenerateRequest, use_debate: bool = False) -> GenerateResponse:
    start_total = time.perf_counter()
    session_id = str(uuid.uuid4())
    outputs: list[AgentOutput] = []
    context_parts: list[str] = []

    start_rag_search = time.perf_counter()
    rag_context = await retrieve_context(request.problem_statement)
    search_context = await search_web(f"latest trends {request.problem_statement}")
    rag_search_duration = time.perf_counter() - start_rag_search

    preferences_str = (
        f"Team size: {request.preferences.team_size}, "
        f"Hackathon type: {request.preferences.hackathon_type}, "
        f"Preferred stack: {request.preferences.preferred_stack}"
    )

    for agent_key in AGENT_SEQUENCE:
        start_agent = time.perf_counter()
        if agent_key == "judge":
            content = await _run_judge_agent(context_parts)
            duration = time.perf_counter() - start_agent
            judge = JudgeScores(**parse_judge_response(content))
            outputs.append(
                AgentOutput(
                    agent=agent_key,
                    title=AGENT_TITLES[agent_key],
                    content=content,
                    duration_sec=round(duration, 2),
                    metadata={"scores": judge.model_dump()},
                )
            )
            total_duration = time.perf_counter() - start_total
            return GenerateResponse(
                session_id=session_id,
                problem_statement=request.problem_statement,
                agents=outputs,
                judge=judge,
                total_duration_sec=round(total_duration, 2),
                rag_search_duration_sec=round(rag_search_duration, 2),
            )

        content = await _run_single_agent(
            agent_key=agent_key,
            problem_statement=request.problem_statement,
            context_parts=context_parts,
            preferences_str=preferences_str,
            rag_context=rag_context,
            search_context=search_context,
            use_debate=use_debate,
        )
        duration = time.perf_counter() - start_agent

        outputs.append(
            AgentOutput(
                agent=agent_key,
                title=AGENT_TITLES[agent_key],
                content=content,
                duration_sec=round(duration, 2),
            )
        )
        context_parts.append(f"### {AGENT_TITLES[agent_key]}\n{content}")

    total_duration = time.perf_counter() - start_total
    return GenerateResponse(
        session_id=session_id,
        problem_statement=request.problem_statement,
        agents=outputs,
        judge=None,
        total_duration_sec=round(total_duration, 2),
        rag_search_duration_sec=round(rag_search_duration, 2),
    )


async def _run_single_agent(
    agent_key: str,
    problem_statement: str,
    context_parts: list[str],
    preferences_str: str,
    rag_context: str,
    search_context: str,
    use_debate: bool,
) -> str:
    prompt_template = AGENT_PROMPTS[agent_key]
    previous = "\n\n".join(context_parts) if context_parts else problem_statement

    if agent_key == "idea":
        prompt = f"Problem statement: {problem_statement}\n\n"
        if rag_context:
            prompt += f"Knowledge base context:\n{rag_context}\n\n"
        if search_context:
            prompt += f"Web research:\n{search_context}\n\n"
        prompt += prompt_template.format(preferences=preferences_str)
    elif agent_key == "architecture":
        prompt = prompt_template.format(idea_output=previous)
    else:
        prompt = prompt_template.format(previous_outputs=previous)

    content = await generate_text(prompt, system=f"You are the {AGENT_TITLES[agent_key]}.")

    if use_debate and agent_key in ("architecture", "backend"):
        content = await _debate_improve(content)

    return content


async def _debate_improve(content: str) -> str:
    critic_prompt = AGENT_PROMPTS["critic"].format(content=content)
    critic_feedback = await generate_text(critic_prompt, system="You are a critical reviewer.")

    improve_prompt = AGENT_PROMPTS["improvement"].format(
        content=content,
        critic_feedback=critic_feedback,
    )
    improved = await generate_text(improve_prompt, system="You are an improvement specialist.")
    return f"{improved}\n\n---\n**Critic Feedback Addressed:**\n{critic_feedback}"


async def _run_judge_agent(context_parts: list[str]) -> str:
    all_outputs = "\n\n".join(context_parts)
    prompt = AGENT_PROMPTS["judge"].format(all_outputs=all_outputs)
    return await generate_text(prompt, system="You are a hackathon judge. Respond in JSON.")
