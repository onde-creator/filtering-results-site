"use client";

import { useEffect, useState } from "react";

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
      } catch (error) {
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
    } catch (error) {
      setResult(null);
      setErrorMessage("결과를 조회하는 중 문제가 발생했습니다.");
    } finally {
      setCheckingResult(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f4",
        padding: "40px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#18181b",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid #e4e4e7",
            background: "#fff",
            fontSize: "14px",
            color: "#52525b",
          }}
        >
          필터링 결과 조회 · 조회 전용
        </div>

        <h1 style={{ marginTop: "16px", fontSize: "34px", marginBottom: "8px" }}>
          필터링 결과 조회
        </h1>

        <p style={{ color: "#52525b", marginBottom: "24px" }}>
          본 페이지는 조회 전용으로 운영되며, 결과 등록 및 수정은 관리자만 가능합니다.
        </p>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>결과 조회</h2>
          <p style={{ color: "#71717a", fontSize: "14px" }}>
            작사가명, 시안명, 마감기한을 입력한 뒤 결과를 조회할 수 있습니다.
          </p>

          {loadingDrafts && (
            <p style={{ color: "#71717a", fontSize: "13px" }}>
              시안 목록을 불러오는 중입니다...
            </p>
          )}

          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              작사가 명
            </label>
            <input
              type="text"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
              placeholder="이름을 입력해주세요"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #e4e4e7",
                background: "#fafaf9",
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              시안명
            </label>
            <select
              value={draftName}
              onChange={(e) => handleDraftChange(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #e4e4e7",
                background: "#fafaf9",
              }}
            >
              {allDrafts.map((item, index) => (
                <option key={`${item.draftName}-${item.deadline}-${index}`} value={item.draftName}>
                  {item.draftName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              마감기한
            </label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #e4e4e7",
                background: "#fafaf9",
              }}
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
            disabled={loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline}
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "14px 16px",
              borderRadius: "16px",
              border: "none",
              background: "#18181b",
              color: "#fff",
              fontWeight: 600,
              opacity:
                loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline
                  ? 0.5
                  : 1,
              cursor:
                loadingDrafts || checkingResult || !writer.trim() || !draftName || !deadline
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {checkingResult ? "조회 중..." : "결과 조회"}
          </button>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: "24px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>조회 결과</h2>

          {errorMessage ? (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {errorMessage}
            </div>
          ) : result ? (
            <div
              style={{
                marginTop: "16px",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid #e4e4e7",
                background: "#fafaf9",
              }}
            >
              <div style={{ marginBottom: "12px", fontWeight: 700, fontSize: "18px" }}>
                결과: {result.status}
              </div>
              <div>작사가명: {result.writer}</div>
              <div>시안명: {result.draftName}</div>
              <div>마감기한: {result.deadline}</div>
            </div>
          ) : (
            <div
              style={{
                marginTop: "16px",
                padding: "20px",
                borderRadius: "16px",
                border: "1px dashed #d4d4d8",
                background: "#fafaf9",
                color: "#71717a",
              }}
            >
              작사가명, 시안명, 마감기한을 입력한 뒤 결과 조회 버튼을 눌러주세요.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
