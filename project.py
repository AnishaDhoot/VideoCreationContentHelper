import os
from typing import TypedDict

#state first
class pipeline_state(TypedDict):
    raw_input: str
    edited_text: str
    script_text: str
    final_text: str

from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

llm=ChatGroq(
    # api_key=os.environ.get("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0.7)

#first node in the graph -> editor node
def editor_node(state: pipeline_state) -> dict:
    # Use the LLM to edit the text
    """Stage 1: clean up grammar, removes typos and refines the tone of the text"""
    prompt = (
        "You are a professional editor. Please edit the following text for grammar, spelling, and tone. while keeping the core message intact. return only the edited text:\n\n"
        f"Text:\n{state['raw_input']}"
    )

    response = llm.invoke(prompt)
    return {
        "edited_text" :  response.content.strip()}

# scond node in the graph -> script node
def script_node(state: pipeline_state) -> dict: 
    # Use the LLM to generate a script based on the edited text
    """Stage 2: generate an engaging video script based on the edited text"""
    prompt = (
        "You are a professional scriptwriter and charismatic Youtube content creator. You are writing a video script . Please create a script based on the following text and transform it into a highly engaging, punchy, conversational video script hook. MAke it sound like a real person speaking passionately. return only the script:\n\n"
        f"Edited Text:\n{state['edited_text']}"
    )

    response = llm.invoke(prompt)
    return {
        "script_text" :  response.content.strip()}

# third node in the graph ->  translation node
def translation_node(state: pipeline_state) -> dict:
    # Use the LLM to translate the script into a different language
    """Stage 3: translate the script into a natural flowing english language"""
    prompt = (
        "You are an expert content localizer for the Indian market. Take the following script "
        "and convert it into natural, flowing 'Hinglish'. Do not simply translate it sentence-by-sentence "
        "or repeat information. Alternating comfortably between Hindi and English phrases just like "
        "an intellectual tech educator would speak naturally on a live stream. Keep the energy high! "
        "Return only the final Hinglish text.\n\n"
        f"Script:\n{state['script_text']}"
    )
    
    response = llm.invoke(prompt)
    return {"final_text": response.content.strip()}

#state and node ready -> graph banane hai, need edges to connect the nodes

from langgraph.graph import StateGraph, START, END

graph = StateGraph(pipeline_state)
graph.add_node("editor", editor_node)
graph.add_node("scriptwriter", script_node)
graph.add_node("translator", translation_node)

graph.add_edge(START, "editor")
graph.add_edge("editor", "scriptwriter")
graph.add_edge("scriptwriter", "translator")
graph.add_edge("translator", END)

#compile graph
app=graph.compile()

result=app.invoke({
    "raw_input": "In the rapidly evolving landscape of technology, staying ahead of the curve is not just an advantage; it's a necessity. As we navigate through the complexities of the digital age, the ability to adapt and innovate becomes paramount. The integration of artificial intelligence, machine learning, and data analytics into our daily operations is no longer a futuristic concept but a present reality. Embracing these advancements allows us to streamline processes, enhance decision-making, and ultimately drive growth. However, with great power comes great responsibility. It is imperative that we approach these technologies with a critical eye, ensuring ethical considerations are at the forefront of our strategies. By fostering a culture of continuous learning and adaptability, we can harness the full potential of technological innovation while mitigating risks. In conclusion, the future belongs to those who are willing to embrace change, leverage cutting-edge tools, and cultivate a mindset geared towards perpetual improvement."
})

print("Edited Text:\n", result['edited_text'])
print("Script Text:\n", result['script_text'])
print("Final Output:\n", result['final_text'])