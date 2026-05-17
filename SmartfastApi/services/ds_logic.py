import math
from utils.data_loader import load_all_data
from constants.index_map import INDEX_MAP
from utils.dynamic_filtering import dynamic_filtering
from utils.feature_engineering import (
    feature_engineering
)

from services.stock_analysis_service import (
    predict_stock_trend
)

from services.ihsg_service import (
    predict_ihsg
)

from utils.portfolio_models import (
    compare_all_models,
    run_selected_model
)

# ==========================
# OPTIONAL GENAI
# ==========================

try:
    from services.genai_service import (
        generate_portfolio_summary
    )

    GENAI_AVAILABLE = True

except Exception:

    GENAI_AVAILABLE = False

def clean_nan(obj):
    """
    Recursively replace NaN
    to None for JSON response
    """

    if isinstance(
        obj,
        dict
    ):

        return {
            k:
            clean_nan(v)
            for k, v
            in obj.items()
        }

    elif isinstance(
        obj,
        list
    ):

        return [
            clean_nan(i)
            for i in obj
        ]

    elif isinstance(
        obj,
        float
    ):

        if math.isnan(obj):

            return None

        if math.isinf(obj):

            return None

        return obj

    return obj

def analyze_portfolio_logic(
    index_choice: str,
    start_date: str,
    end_date: str,
    investment_amount: float,
    model_choice: str = "ALL"
):
    """
    Main logic analyze portfolio
    """

    # ==========================
    # LOAD DATA
    # ==========================

    data = load_all_data()

    price_matrix = data["price_matrix"]
    market_price = data["market_price"]
    bi_rate = data["bi_rate"]

    # ==========================
    # DYNAMIC FILTERING
    # ==========================

    filtered_result = dynamic_filtering(
        index_choice=index_choice,
        start_date=start_date,
        end_date=end_date,
        price_matrix=price_matrix,
        market_price=market_price,
        bi_rate_daily=bi_rate,
        index_map=INDEX_MAP
    )

    # ==========================
    # FEATURE ENGINEERING
    # ==========================

    feature_result = feature_engineering(
        filtered_price=filtered_result[
            "filtered_price"
        ],
        filtered_market=filtered_result[
            "filtered_market"
        ],
        filtered_bi_rate=filtered_result[
            "filtered_bi_rate"
        ]
    )

    # ==================================================
    # MODEL ALL
    # ==================================================

    if model_choice == "ALL":

        compare_result = compare_all_models(
            feature_result=feature_result,
            investment_amount=investment_amount
        )

        comparison = (
            compare_result[
                "comparison_df"
            ]
            .to_dict(
                orient="records"
            )
        )

        # ==========================
        # PREDICT IHSG
        # ==========================

        ihsg_result = predict_ihsg()

        market_trend = (
            ihsg_result[
                "market_trend"
            ]
        )

        portfolios = {}

        for item in comparison:

            portfolios[
                item[
                    "Model"
                ]
            ] = {

                "annual_return":
                    item[
                        "Annual Return"
                    ],

                "annual_risk":
                    item[
                        "Annual Risk"
                    ],

                "sharpe_ratio":
                    item[
                        "Sharpe Ratio"
                    ]
            }

        # ==========================
        # PICK BEST METHOD
        # ==========================

        if market_trend == "Bullish":

            best_method = max(
                portfolios.keys(),
                key=lambda x:
                portfolios[x][
                    "sharpe_ratio"
                ]
            )

        elif market_trend == "Bearish":

            best_method = min(
                portfolios.keys(),
                key=lambda x:
                portfolios[x][
                    "annual_risk"
                ]
            )

        else:

            max_sharpe = max(
                p["sharpe_ratio"]
                for p in (
                    portfolios
                    .values()
                )
            )

            min_risk = min(
                p["annual_risk"]
                for p in (
                    portfolios
                    .values()
                )
            )

            max_risk = max(
                p["annual_risk"]
                for p in (
                    portfolios
                    .values()
                )
            )

            scores = {}

            for name, p in (
                portfolios.items()
            ):

                sharpe_score = (
                    p[
                        "sharpe_ratio"
                    ]
                    /
                    max_sharpe
                    if max_sharpe > 0
                    else 0
                )

                risk_score = (
                    1
                    -
                    (
                        (
                            p[
                                "annual_risk"
                            ]
                            -
                            min_risk
                        )
                        /
                        (
                            max_risk
                            -
                            min_risk
                        )
                    )
                    if max_risk >
                    min_risk
                    else 1
                )

                scores[
                    name
                ] = (
                    0.6
                    * sharpe_score
                    +
                    0.4
                    * risk_score
                )

            best_method = max(
                scores.keys(),
                key=lambda x:
                scores[x]
            )

        # ==========================
        # RUN WINNER MODEL
        # ==========================

        result = run_selected_model(
            model_choice=best_method,
            feature_result=feature_result,
            investment_amount=investment_amount
        )

    else:

        result = run_selected_model(
            model_choice=model_choice,
            feature_result=feature_result,
            investment_amount=investment_amount
        )

        best_method = result[
            "method"
        ]

        ihsg_result = None
        comparison = None

    # ==========================
    # FILTER POSITIVE WEIGHT
    # ==========================

    weights_df = result[
        "weights"
    ]

    weights_df = (
        weights_df[
            weights_df[
                "Weight"
            ] > 0
        ]
    )

    # ==========================
    # CAPM TOP 10
    # ==========================

    if result[
        "method"
    ] == "CAPM":

        weights_df = (
            weights_df
            .sort_values(
                by="Weight",
                ascending=False
            )
            .head(10)
        )

        total_weight = (
            weights_df[
                "Weight"
            ].sum()
        )

        weights_df[
            "Weight"
        ] = (
            weights_df[
                "Weight"
            ]
            /
            total_weight
        )

        weights_df[
            "Allocation"
        ] = (
            weights_df[
                "Weight"
            ]
            *
            investment_amount
        )

    # ==========================
    # BUILD PORTFOLIO
    # ==========================

    portfolio = []

    for _, row in (
        weights_df.iterrows()
    ):

        stock_prediction = (
            predict_stock_trend(
                row[
                    "Ticker"
                ]
            )
        )

        item = {

            "ticker":
                row[
                    "Ticker"
                ],

            "weight":
                round(
                    float(
                        row[
                            "Weight"
                        ]
                    ),
                    4
                ),

            "allocation":
                round(
                    float(
                        row[
                            "Allocation"
                        ]
                    ),
                    2
                ),

            "trend":
                stock_prediction[
                    "trend"
                ],

            "confidence":
                stock_prediction[
                    "confidence"
                ],

            "recommendation":
                stock_prediction[
                    "recommendation"
                ]
        }

        # SIM/CAPM alpha beta
        if result[
            "method"
        ] in [
            "SIM",
            "CAPM"
        ]:

            if (
                "alpha"
                in row.index
            ):

                item[
                    "alpha"
                ] = round(
                    float(
                        row[
                            "alpha"
                        ]
                    ),
                    4
                )

            if (
                "beta"
                in row.index
            ):

                item[
                    "beta"
                ] = round(
                    float(
                        row[
                            "beta"
                        ]
                    ),
                    4
                )

        portfolio.append(
            item
        )

    # ==========================
    # DASHBOARD SUMMARY
    # ==========================

    selected_method_result = {

        "annual_return":
            round(
                float(
                    result[
                        "portfolio_annual_return"
                    ]
                ) * 100,
                2
            ),

        "annual_risk":
            round(
                float(
                    result[
                        "portfolio_annual_risk"
                    ]
                ) * 100,
                2
            ),

        "sharpe_ratio":
            round(
                float(
                    result[
                        "sharpe_ratio"
                    ]
                ),
                2
            ),

        "alpha":
            None,

        "beta":
            None
    }


    # ==========================
    # CLEAN NAN VALUE
    # ==========================

    for key in [
        "annual_return",
        "annual_risk",
        "sharpe_ratio"
    ]:

        value = selected_method_result[
            key
        ]

        if (
            isinstance(
                value,
                float
            )
            and
            math.isnan(
                value
            )
        ):

            selected_method_result[
                key
            ] = None

    # ==========================
    # ALPHA BETA SUMMARY
    # ==========================

    alpha_values = []
    beta_values = []

    if result["method"] in [
        "SIM",
        "CAPM"
    ]:

        for item in portfolio:

            if (
                "alpha"
                in item
            ):

                alpha_values.append(
                    item[
                        "alpha"
                    ]
                )

            if (
                "beta"
                in item
            ):

                beta_values.append(
                    item[
                        "beta"
                    ]
                )

    alpha_avg = (
        round(
            sum(alpha_values)
            /
            len(alpha_values),
            4
        )
        if alpha_values
        else None
    )

    beta_avg = (
        round(
            sum(beta_values)
            /
            len(beta_values),
            4
        )
        if beta_values
        else None
    )


    # ==========================
    # TREYNOR RATIO
    # ==========================

    risk_free_rate = 5

    annual_return = round(
        float(
            result[
                "portfolio_annual_return"
            ]
        ) * 100,
        2
    )

    annual_risk = round(
        float(
            result[
                "portfolio_annual_risk"
            ]
        ) * 100,
        2
    )

    sharpe_ratio = round(
        float(
            result[
                "sharpe_ratio"
            ]
        ),
        2
    )

    if (
        beta_avg is not None
        and beta_avg != 0
    ):

        treynor_ratio = round(
            (
                annual_return
                -
                risk_free_rate
            )
            /
            beta_avg,
            4
        )

    else:

        treynor_ratio = None


    # ==========================
    # METHOD REASON
    # ==========================

    ihsg_result = (
        predict_ihsg()
    )

    trend = (
        ihsg_result[
            "market_trend"
        ]
    )

    confidence = (
        ihsg_result[
            "confidence"
        ]
    )

    if trend == "Bullish":

        reason = (
            f"IHSG diprediksi "
            f"NAIK → fokus "
            f"return maksimal "
            f"(Sharpe ratio "
            f"tertinggi: "
            f"{sharpe_ratio})"
        )

    elif trend == "Bearish":

        reason = (
            f"IHSG diprediksi "
            f"TURUN → fokus "
            f"risiko rendah "
            f"(Risk: "
            f"{annual_risk}%)"
        )

    else:

        reason = (
            "IHSG sideways → "
            "menggunakan "
            "keseimbangan "
            "Sharpe Ratio "
            "dan Risk"
        )


    # ==========================
    # PORTFOLIO SUMMARY
    # ==========================

    portfolio_summary = (
        generate_portfolio_summary(

            best_method=
                result[
                    "method"
                ],

            annual_return=
                annual_return,

            annual_risk=
                annual_risk,

            sharpe_ratio=
                sharpe_ratio,

            alpha=
                alpha_avg,

            beta=
                beta_avg,

            portfolio=
                portfolio,

            market_trend=
                trend,

            confidence=
                confidence,

            investment_amount=
                investment_amount,

            reason=
                reason
        )
    )

    # ==========================
    # RESPONSE
    # ==========================

    response = {

    "ihsg_prediction":
        ihsg_result,

    "best_method":
        best_method,

    "selected_method_result":
        selected_method_result,

    "comparison":
        comparison,

    "portfolio":
        portfolio,

    "portfolio_summary":
        portfolio_summary
}

    return clean_nan(
    response
)