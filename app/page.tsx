"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz3hqQ5mdYzGP8lu9R5LEQnmmndj9cf0LxNhwGHaX-zYRxL50aU3_Gf-jPGH_ubxNvfFQ/exec";

type DraftItem = {
  draftName: string;
  deadline: string;
};

type CheckResponse = {
  success: boolean;
  writer: string;
  draftName: string;
  deadline: string;
  status: "통과" | "미통과";
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f4",
    padding: "40px 24px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#18181b",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid #e4e4e7",
    background: "#fff",
    fontSize: "14px",
    color: "#52525b",
  },
  title: {
    marginTop: "16px",
    marginBottom: "8px",
    fontSize: "34px",
  },
  description: {
    color: "#52525b",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e4e4e7",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
  },
  subText: {
    color: "#71717a",
    fontSize: "14px",
  },
  fieldWrap: {
    marginTop: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #e4e4e7",
    background: "#fafaf9",
  },
  helper: {
    color: "#71717a",
    fontSize: "13px",
  },
  button: {
    marginTop: "24px",
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "none",
    background: "#18181b",
    color: "#fff",
    fontWeight: 600,
  },
  error: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
  },
  empty: {
    marginTop: "16px",
    padding: "20px",
    borderRadius: "16px",
    border: "1px dashed #d4d4d8",
    background: "#fafaf9",
    color: "#71717a",
  },
  resultBox: {
    marginTop: "16px",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e4e4e7",
    background: "#fafaf9",
  },
  resultTitle: {
    marginBottom: "12px",
    fontWeight: 700,
    fontSize: "18px",
  },
};

export default function Page() {
  const [writer, setWriter] = useState("");
  const [allDrafts, setAllDrafts] = useState<DraftItem[]>([]);
  const [draftName, setDraftName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [checkingResult, setCheckingResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch(`${WEB_APP_URL}?mode=drafts`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.items)) {
          throw new Error("draft fetch failed");
        }

        setAllDrafts(data.items);

        if (data.items.length > 0) {
          setDraftName(data.items[0].draftName);
          setDeadline(data.items[0].deadline);
        }
      } catch {
        setErrorMessage("시안 목록을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoadingDrafts(false);
      }
    };

    fetchDrafts();
  }, []);

  const availableDeadlines = allDrafts
    .filter((item) => item.draftName === draftName)
    .map((item) => item.deadline);

  const handleDraftChange = (value: string) => {
    setDraftName(value);
    const matched = allDrafts.find((item) => item.draftName === value);
    setDeadline(matched ? matched.deadline : "");
  };

  const handleSearch = async () => {
    try {
      setCheckingResult(true);
      setErrorMessage("");

      const params = new URLSearchParams({
        mode: "check",
        writer: writer.trim(),
        draftName,
        deadline,
      });

      const response = await fetch(`${WEB_APP_URL}?${params.toString()}`);
      const data: CheckResponse = await response.json();

      if (!data.success) {
        throw new Error("check failed");
      }

      setResult(data);
    } catch {
      setResult(null);
      setErrorMessage("결과를 조회하는 중 문제가 발생했습니다.");
    } finally {
      setCheckingResult(false);
    }
  };

  const statusStyle = (status: "통과" | "미통과"): CSSProperties => ({
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 600,
    border: `1px solid ${status === "통과" ? "#bbf7d0" : "#fecdd3"}`,
    background: status === "통과" ? "#dcfce7" : "#fff1f2",
    color: status === "통과" ? "#15803d" : "#be123c",
  });

  const buttonDisabled =
    loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.badge}>필터링 결과 조회 · 조회 전용</div>

        <h1 style={styles.title}>필터링 결과 조회</h1>

        <p style={styles.description}>
          본 페이지는 조회 전용으로 운영되며, 결과 등록 및 수정은 관리자만 가능합니다.
        </p>

        <section style={styles.card}>
          <h2>결과 조회</h2>
          <p style={styles.subText}>
            작사가명, 시안명, 마감기한을 입력한 뒤 결과를 조회할 수 있습니다.
          </p>

          {loadingDrafts && <p style={styles.helper}>시안 목록을 불러오는 중입니다...</p>}

          <div style={styles.fieldWrap}>
            <label style={styles.label}>작사가 명</label>
            <input
              type="text"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
              placeholder="이름을 입력해주세요"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>시안명</label>
            <select
              value={draftName}
              onChange={(e) => handleDraftChange(e.target.value)}
              style={styles.input}
            >
              {allDrafts.map((item, index) => (
                <option key={`${item.draftName}-${item.deadline}-${index}`} value={item.draftName}>
                  {item.draftName}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>마감기한</label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={styles.input}
            >
              {availableDeadlines.map((item, index) => (
                <option key={`${item}-${index}`} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={buttonDisabled}
            style={{
              ...styles.button,
              opacity: buttonDisabled ? 0.5 : 1,
              cursor: buttonDisabled ? "not-allowed" : "pointer",
            }}
          >
            {checkingResult ? "조회 중..." : "결과 조회"}
          </button>
        </section>

        <section style={styles.card}>
          <h2>조회 결과</h2>

          {errorMessage ? (
            <div style={styles.error}>{errorMessage}</div>
          ) : result ? (
            <div style={styles.resultBox}>
              <div style={styles.resultTitle}>
                결과: <span style={statusStyle(result.status)}>{result.status}</span>
              </div>
              <div>작사가명: {result.writer}</div>
              <div>시안명: {result.draftName}</div>
              <div>마감기한: {result.deadline}</div>
            </div>
          ) : (
            <div style={styles.empty}>
              작사가명, 시안명, 마감기한을 입력한 뒤 결과 조회 버튼을 눌러주세요.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
