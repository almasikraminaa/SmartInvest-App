from fastapi import (
    APIRouter,
    HTTPException
)

from services.ihsg_service import (
    predict_ihsg
)

router = APIRouter()


@router.post(
    "/predict-ihsg"
)
def predict_ihsg_route():

    try:
        return predict_ihsg()

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )