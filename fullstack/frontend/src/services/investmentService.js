import { supabase } from "./supabaseClient";

const MAX_HISTORY = 20;

// SAVE HISTORY
export const saveInvestmentHistory =
  async ({
    targetIndex,
    method,
    capital,
    expectedReturn,
    risk,
    sharpeRatio,
    marketSentiment,
    biRate,
    startDate,
    endDate,
    aiInterpretation,
    portfolioAllocation,

    analysisForm,
    analysisResult,
  }) => {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "User tidak terautentikasi."
        );
      }

      // ==========================
      // CHECK HISTORY LIMIT
      // ==========================
      const {
        data: histories,
        error: historyError,
      } = await supabase
        .from(
          "investment_histories"
        )
        .select(
          "id, created_at"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );

      if (historyError)
        throw historyError;

      // jika sudah max
      if (
        histories &&
        histories.length >=
          MAX_HISTORY
      ) {
        const oldestHistory =
          histories[0];

        const {
          error: deleteError,
        } = await supabase
          .from(
            "investment_histories"
          )
          .delete()
          .eq(
            "id",
            oldestHistory.id
          );

        if (deleteError)
          throw deleteError;
      }

      // ==========================
      // INSERT NEW HISTORY
      // ==========================
      const {
        data,
        error,
      } = await supabase
        .from(
          "investment_histories"
        )
        .insert([
          {
            user_id: user.id,

            target_index:
              targetIndex,

            method,
            capital,

            expected_return:
              expectedReturn,

            risk,

            sharpe_ratio:
              sharpeRatio,

            market_sentiment:
              marketSentiment,

            bi_rate:
              biRate,

            start_date:
              startDate,

            end_date:
              endDate,

            ai_interpretation:
              aiInterpretation,

            portfolio_allocation:
              portfolioAllocation,

            analysis_form:
              analysisForm,

            analysis_result:
              analysisResult,
          },
        ])
        .select();

      if (error) throw error;

      return {
        data,
        error: null,
      };
    } catch (error) {
      console.error(
        "Gagal menyimpan riwayat:",
        error.message
      );

      return {
        data: null,
        error: error.message,
      };
    }
  };

// FETCH HISTORY
export const fetchUserHistories =
  async () => {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "User tidak login."
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "investment_histories"
        )
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error)
        throw error;

      return {
        data,
        error: null,
      };
    } catch (error) {
      console.error(
        "Gagal mengambil riwayat:",
        error.message
      );

      return {
        data: null,
        error: error.message,
      };
    }
  };