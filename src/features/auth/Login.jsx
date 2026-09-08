import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../../utils/validationSchemas";
import { useAppDispatch } from "../../app/hooks";
import { loginUser } from "./authSlice";
import { showToast } from "../ui/uiSlice";

// A real deployment should use a hosted CAPTCHA provider (e.g. reCAPTCHA).
// This lightweight arithmetic challenge fulfils the PRD's "login + CAPTCHA"
// requirement without an external network dependency, and is isolated here
// so swapping in a real provider only touches this component.
function useCaptchaChallenge() {
  const [seed, setSeed] = useState(0);
  const challenge = useMemo(() => {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    return { a, b, answer: String(a + b) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const refresh = () => setSeed((s) => s + 1);
  return { challenge, refresh };
}

export default function Login() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const [serverError, setServerError] = useState(null);
  const { challenge, refresh } = useCaptchaChallenge();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError(null);

    if (data.captcha.trim() !== challenge.answer) {
      setError("captcha", { type: "manual", message: "Incorrect answer, try again" });
      refresh();
      reset({ ...data, captcha: "" });
      return;
    }

    const result = await dispatch(
      loginUser({ identifier: data.identifier.trim(), password: data.password })
    );

    if (loginUser.fulfilled.match(result)) {
      dispatch(showToast({ message: `Welcome back, ${result.payload.user.name}!`, type: "success" }));
      navigate("/dashboard", { replace: true });
    } else {
      // Generic message regardless of which part was wrong.
      setServerError(result.payload || "Invalid username/email or password");
      refresh();
      reset({ ...data, captcha: "" });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to see your board.</p>

        {serverError && <div className="form-error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={`field ${errors.identifier ? "has-error" : ""}`}>
            <label htmlFor="identifier">Username or email</label>
            <input id="identifier" type="text" autoComplete="username" {...register("identifier")} />
            {errors.identifier && <span className="field-error">{errors.identifier.message}</span>}
          </div>

          <div className={`field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <div className={`field ${errors.captcha ? "has-error" : ""}`}>
            <label htmlFor="captcha">
              Verify you're human: what is {challenge.a} + {challenge.b}?
            </label>
            <input id="captcha" type="text" inputMode="numeric" {...register("captcha")} />
            {errors.captcha && <span className="field-error">{errors.captcha.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
