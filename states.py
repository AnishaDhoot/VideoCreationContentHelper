#so we are creating a graph, first we create a state

import os

#1) typed dictionary for the states(most used)
from typing import TypedDict
class Satate(TypedDict):
    topic: str
    summary: str
    score: int

#2) pydiantic model for the states - good for data validation & runtime type checking
from pydantic import BaseModel, field_validator

class StateModel(BaseModel):
    topic: str
    summary: str =""
    score: int

    @field_validator
    def score_positive(cls, v):
        if v < 0:
            raise ValueError("score must be positive")
        return v

#3) python dataclass for the states - rarely used
from dataclasses import dataclass,field

@dataclass
class StateDataClass:
    topic: str
    summary: str = field(default="")
    score: int = field(default=0)

#4`) langgraph MessageState for the states - good for graph based applications
from langgraph import MessageState
class State(MessageState):
    username: str
    language: str