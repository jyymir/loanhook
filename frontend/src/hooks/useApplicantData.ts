import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Applicant } from "../types/financial";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function useApplicantData() {
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch applicant data");
        }

        setApplicant(data);
      } catch (error) {
        console.error("Error fetching applicant data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [navigate]);

  return { applicant, loading };
}