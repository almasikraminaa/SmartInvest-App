from fastapi import APIRouter, HTTPException, status
from services.ihsg_service import predict_ihsg

router = APIRouter()

@router.post("/predict-ihsg")
def predict_ihsg_route():
    try:
        # Menjalankan logika prediksi IHSG
        result = predict_ihsg()
        
        # Validasi jika hasil prediksi kosong atau gagal secara logika
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data prediksi tidak tersedia atau gagal diproses."
            )
            
        return result

    except FileNotFoundError as fnf:
        # Menangani jika file ihsg_best_model_3class.keras atau scaler tidak ditemukan
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Aset model AI tidak ditemukan: {str(fnf)}"
        )

    except Exception as e:
        # Menangani error umum (API Gemini down atau masalah Supabase)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal melakukan prediksi IHSG: {str(e)}"
        )