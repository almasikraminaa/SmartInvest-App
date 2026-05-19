import axios from "axios";

const API =
import.meta.env
.VITE_AI_BASE_URL;

console.log(API);

export const analyzePortfolio =
async (payload) => {

  const response =
  await axios.post(
    `${API}/api/analyze-portfolio`,
    payload
  );

  return response.data;
};