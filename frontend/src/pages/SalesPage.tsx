import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { formatEuro } from "../utils/money";
import type { Dashboard } from "../types";
import "./AdminPages.css";

// A short overview for the owner: today, the best sellers and the last week.

export function SalesPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Loading failed"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading the numbers..." />;

  if (error || !data) {
    return (
      <div className="page">
        <Message text={error || "No data"} type="error" />
      </div>
    );
  }

  // The longest bar is the busiest day; the rest is compared to that one.
  const highestDay = Math.max(...data.last7Days.map((day) => day.totalCents), 1);

  function dayLabel(date: string) {
    return new Date(date).toLocaleDateString("nl-NL", {
      weekday: "short",
      day: "numeric",
    });
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>Sales</h2>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-label">Sales today</span>
          <span className="stat-value">{formatEuro(data.todayTotalCents)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders today</span>
          <span className="stat-value">{data.todayOrderCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average order</span>
          <span className="stat-value">{formatEuro(data.averageOrderCents)}</span>
        </div>
      </div>

      <div className="sales-columns">
        <section>
          <h3 className="section-title">Last 7 days</h3>
          <div className="bar-chart">
            {data.last7Days.map((day) => (
              <div className="bar-row" key={day.date}>
                <span className="bar-day">{dayLabel(day.date)}</span>
                <span className="bar-track">
                  <span
                    className="bar-fill"
                    style={{ width: `${(day.totalCents / highestDay) * 100}%` }}
                  />
                </span>
                <span className="bar-amount">{formatEuro(day.totalCents)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="section-title">Best selling products</h3>
          {data.bestSellers.length === 0 ? (
            <p className="empty">Nothing sold yet</p>
          ) : (
            <ol className="best-sellers">
              {data.bestSellers.map((item, index) => (
                <li key={item.productName}>
                  <span>
                    <span className="rank">{index + 1}</span>
                    {item.productName}
                  </span>
                  <span className="best-seller-count">{item.quantity} sold</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
