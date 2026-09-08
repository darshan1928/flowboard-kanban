import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema } from "../../utils/validationSchemas";
import { useAppDispatch } from "../../app/hooks";
import { signupUser } from "./authSlice";
import { showToast } from "../ui/uiSlice";
import * as api from "../../api/mockBackend";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Signup() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(signupSchema), mode: "onBlur" });

  const [serverError, setServerError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const debounceRef = useRef(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Debounced async availability check for username/email — doesn't block
  // typing, just flags a conflict before the user hits submit.
  const checkAvailability = useCallback(
    (field, value) => {
      if (!value) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const { available } = await api.checkAvailability({ field, value });
        if (!available) {
          setError(field, {
            type: "manual",
            message: field === "email" ? "Email is already registered" : "Username already taken",
          });
        } else {
          clearErrors(field);
        }
      }, 400);
    },
    [setError, clearErrors]
  );

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageError(null);
    setImagePreview(null);
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPG, PNG or WEBP images are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be smaller than 2MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setServerError(null);
    const result = await dispatch(
      signupUser({ ...data, avatarUrl: imagePreview })
    );
    if (signupUser.fulfilled.match(result)) {
      dispatch(showToast({ message: "Account created. Please log in.", type: "success" }));
      navigate("/login", { replace: true });
    } else {
      setServerError(result.payload || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-sub">Track your day-to-day tasks on a simple Kanban board.</p>

        {serverError && <div className="form-error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={`field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" autoComplete="name" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className={`field ${errors.username ? "has-error" : ""}`}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register("username", {
                onChange: (e) => checkAvailability("username", e.target.value.trim()),
              })}
            />
            {errors.username && <span className="field-error">{errors.username.message}</span>}
          </div>

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                onChange: (e) => checkAvailability("email", e.target.value.trim()),
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className={`field ${errors.contactNumber ? "has-error" : ""}`}>
            <label htmlFor="contactNumber">Contact number <span className="field-hint">(optional)</span></label>
            <input id="contactNumber" type="tel" autoComplete="tel" {...register("contactNumber")} />
            {errors.contactNumber && (
              <span className="field-error">{errors.contactNumber.message}</span>
            )}
          </div>

          <div className={`field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password ? (
              <span className="field-error">{errors.password.message}</span>
            ) : (
              <span className="field-hint">Min 8 chars, upper &amp; lowercase, number, symbol</span>
            )}
          </div>

          <div className={`field ${errors.confirmPassword ? "has-error" : ""}`}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="avatar">Profile image <span className="field-hint">(optional)</span></label>
            <input id="avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            {imageError && <span className="field-error">{imageError}</span>}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Profile preview"
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", marginTop: 6 }}
              />
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
