from pydantic import BaseModel
from typing import Optional


class PortfolioRequest(BaseModel):
    index_choice: str
    start_date: str
    end_date: str
    investment_amount: float
    model_choice: Optional[str] = "ALL"


class IHSGRequest(BaseModel):
    index_choice: str
    start_date: str
    end_date: str
    investment_amount: float
    