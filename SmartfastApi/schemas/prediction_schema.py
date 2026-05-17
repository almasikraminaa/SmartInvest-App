from pydantic import BaseModel
from typing import List


class StockData(BaseModel):
    ticker: str
    ohlcv_10days: list


class PredictionRequest(BaseModel):
    stocks: List[StockData]