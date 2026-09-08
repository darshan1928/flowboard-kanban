import * as yup from "yup";
import { PRIORITIES } from "./constants";

const NAME_REGEX = /^[A-Za-z\s]{2,50}$/;
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,19}$/; // no leading digit, 3-20 chars
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PHONE_REGEX = /^[0-9]{10,15}$/;

export const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .matches(NAME_REGEX, "Name should be 2-50 letters and spaces only"),
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .matches(
      USERNAME_REGEX,
      "3-20 chars, letters/numbers/underscore, can't start with a number"
    ),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),
  contactNumber: yup
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional()
    .matches(PHONE_REGEX, {
      message: "Enter 10-15 digits only",
      excludeEmptyString: true,
    }),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      PASSWORD_REGEX,
      "Min 8 chars incl. uppercase, lowercase, number & special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export const loginSchema = yup.object({
  identifier: yup.string().trim().required("Username or email is required"),
  password: yup.string().required("Password is required"),
  captcha: yup.string().required("Please complete the CAPTCHA"),
});

export const taskSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Task name is required")
    .max(80, "Keep task names under 80 characters"),
  priority: yup
    .string()
    .oneOf(PRIORITIES, "Choose a priority")
    .required("Priority is required"),
  deadline: yup.string().required("Deadline is required"),
});
