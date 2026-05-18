from pydantic import BaseModel


class IHSGRequest(
    BaseModel
):
    index_choice: str

    start_date: str

    end_date: str

    investment_amount: float