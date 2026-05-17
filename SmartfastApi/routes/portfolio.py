from fastapi import APIRouter, HTTPException, status
from schemas.portfolio_schema import PortfolioRequest
from services.portfolio_service import analyze_portfolio

router = APIRouter()

@router.post("/analyze-portfolio")
def analyze(request: PortfolioRequest):
    try:
        # Menjalankan logika utama analisis portofolio
        result = analyze_portfolio(request)
        
        # Jika service mengembalikan error spesifik dari DS/AI logic
        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=result.get("message", "Terjadi kesalahan pada logika analisis.")
            )
            
        return result

    except ValueError as ve:
        # Error handling untuk input yang tidak valid (misal: nominal terlalu kecil)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Input tidak valid: {str(ve)}"
        )
        
    except Exception as e:
        # Error handling untuk masalah server atau kegagalan API Gemini/Model
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan internal server: {str(e)}"
        )