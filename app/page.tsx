"use client";

import { useEffect, useMemo, useState } from "react";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3hqQ5mdYzGP8lu9R5LEQnmmndj9cf0LxNhwGHaX-zYRxL50aU3_Gf-jPGH_ubxNvfFQ/exec";

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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f4",
    color: "#18181b",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #e4e4e7",
    background: "white",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "14px",
    color: "#52525b",
  },
  title: {
    marginTop: "16px",
    marginBottom: "8px",
    fontSize: "34px",
    fontWeight: 700,
  },
  description: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#52525b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "24px",
    marginTop: "32px",
  },
  card: {
    background: "white",
    border: "1px solid #e4e4e7",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
  },
  cardSub: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#71717a",
  },
  fieldWrap: {
    marginTop: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#3f3f46",
  },
  input: {
    width: "100%",
    borderRadius: "16px",
    border: "1px solid #e4e4e7",
    background: "#fafaf9",
    padding: "14px 16px",
    fontSize: "14px",
    outline: "none",
  },
  helper: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#71717a",
  },
  button: {
    marginTop: "24px",
    width: "100%",
    border: "none",
    borderRadius: "16px",
    background: "#18181b",
    color: "white",
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  infoBox: {
    background: "#fafaf9",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#52525b",
  },
  resultCard: {
    marginTop: "32px",
    background: "white",
    border: "1px solid #e4e4e7",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  resultEmpty: {
    marginTop: "20px",
    borderRadius: "18px",
    border: "1px dashed #d4d4d8",
    background: "#fafaf9",
    padding: "32px 20px",
    textAlign: "center" as const,
    fontSize: "14px",
    color: "#71717a",
  },
  resultBox: {
    marginTop: "20px",
    borderRadius: "18px",
    border: "1px solid #e4e4e7",
    background: "#fafaf9",
    padding: "20px",
  },
  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  resultGrid: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    background: "white",
    borderRadius: "18px",
    padding: "16px",
  },
  resultLabel: {
    fontSize: "13px",
    color: "#71717a",
    marginBottom: "6px",
  },
  resultValue: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#27272a",
  },
  error: {
    marginTop: "20px",
    borderRadius: "18px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    padding: "16px",
    fontSize: "14px",
    color: "#b91c1c",
  },
};

export default function Page() {
  const [writer, setWriter] = useState("");
  const [allDrafts, setAllDrafts] = useState<DraftItem[]>([]);
  const [draftName, setDraftName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [checkingResult, setCheckingResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoadingDrafts(true);
        setErrorMessage("");

        const response = await fetch(`${WEB_APP_URL}?mode=drafts`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.items)) {
          throw new Error("시안 목록을 불러오지 못했습니다.");
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

  const availableDeadlines = useMemo(() => {
    return allDrafts.filter((item) => item.draftName === draftName).map((item) => item.deadline);
  }, [allDrafts, draftName]);

  const handleDraftChange = (value: string) => {
    setDraftName(value);
    const nextDeadline = allDrafts.find((item) => item.draftName === value)?.deadline ?? "";
    setDeadline(nextDeadline);
  };

  const handleSearch = async () => {
    try {
      setCheckingResult(true);
      setSearched(true);
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
        throw new Error("조회에 실패했습니다.");
      }

      setResult(data);
    } catch {
      setResult(null);
      setErrorMessage("결과를 조회하는 중 문제가 발생했습니다.");
    } finally {
      setCheckingResult(false);
    }
  };

  const statusStyle = (status: "통과" | "미통과") => ({
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: 600,
    border: `1px solid ${status === "통과" ? "#bbf7d0" : "#fecdd3"}`,
    background: status === "통과" ? "#dcfce7" : "#fff1f2",
    color: status === "통과" ? "#15803d" : "#be123c",
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.badge}>필터링 결과 조회 · 조회 전용</div>
        <h1 style={styles.title}>필터링 결과 조회</h1>
        <p style={styles.description}>
          본 페이지는 조회 전용으로 운영되며, 결과 등록 및 수정은 관리자만 가능합니다.
        </p>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>결과 조회</h2>
            <p style={styles.cardSub}>작사가명, 시안명, 마감기한을 입력한 뒤 결과를 조회할 수 있습니다.</p>
            {loadingDrafts && <p style={styles.helper}>시안 목록을 불러오는 중입니다...</p>}

            <div style={styles.fieldWrap}>
              <label style={styles.label}>작사가 명</label>
              <input
                style={styles.input}
                type="text"
                value={writer}
                onChange={(e) => setWriter(e.target.value)}
                placeholder="이름을 입력해주세요"
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>시안명</label>
              <select
                style={styles.input}
                value={draftName}
                onChange={(e) => handleDraftChange(e.target.value)}
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
                style={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              >
                {availableDeadlines.map((item, index) => (
                  <option key={`${item}-${index}`} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p style={styles.helper}>마감기한은 1개의 날짜만 선택하는 방식입니다.</p>
            </div>

            <button
              style={{
                ...styles.button,
                ...(loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline
                  ? styles.buttonDisabled
                  : {}),
              }}
              onClick={handleSearch}
              disabled={loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline}
            >
              {checkingResult ? "조회 중..." : "결과 조회"}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>운영 안내</h2>
            <div style={styles.infoBox}>
              <strong>운영 방식</strong>
              <br />
              관리자는 통과 이력만 등록하고, 조회자는 작사가명·시안명·마감기한 조건으로 결과만 확인하는 구조입니다.
            </div>
            <div style={styles.infoBox}>
              <strong>조회 결과 표시</strong>
              <br />
              입력한 작사가명·시안명·마감기한과 일치하는 통과 이력이 있으면 통과, 없으면 미통과로 표시됩니다.
            </div>
            <div style={styles.infoBox}>
              <strong>보안 포인트</strong>
              <br />
              민감한 정보이므로 로그인 후 조회하는 구조를 권장합니다.
            </div>
          </div>
        </section>

        <section style={styles.resultCard}>
          <h2 style={styles.cardTitle}>조회 결과</h2>
          <p style={styles.cardSub}>입력한 조건과 일치하는 결과만 표시됩니다.</p>

          {errorMessage ? (
            <div style={styles.error}>{errorMessage}</div>
          ) : !searched ? (
            <div style={styles.resultEmpty}>작사가명, 시안명, 마감기한을 입력한 뒤 결과 조회 버튼을 눌러주세요.</div>
          ) : result ? (
            <div style={styles.resultBox}>
              <div style={styles.resultTop}>
                <div>
                  <div style={styles.resultLabel}>작사가 명</div>
                  <div style={{ ...styles.resultValue, fontSize: "20px" }}>{result.writer || "-"}</div>
                </div>
                <span style={statusStyle(result.status)}>{result.status}</span>
              </div>

              <div style={styles.resultGrid}>
                <div>
                  <div style={styles.resultLabel}>작사가 명</div>
                  <div style={styles.resultValue}>{result.writer}</div>
                </div>
                <div>
                  <div style={styles.resultLabel}>시안명</div>
                  <div style={styles.resultValue}>{result.draftName}</div>
                </div>
                <div>
                  <div style={styles.resultLabel}>마감기한</div>
                  <div style={styles.resultValue}>{result.deadline}</div>
                </div>
                <div>
                  <div style={styles.resultLabel}>결과</div>
                  <div style={styles.resultValue}>{result.status}</div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
