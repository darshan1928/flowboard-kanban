import { signupSchema, taskSchema } from "./validationSchemas";

const validSignup = {
  name: "Jordan Blake",
  username: "jordan_b",
  email: "jordan@example.com",
  contactNumber: "",
  password: "Str0ng!Pass",
  confirmPassword: "Str0ng!Pass",
};

describe("signupSchema", () => {
  test("accepts a fully valid payload", async () => {
    await expect(signupSchema.validate(validSignup)).resolves.toBeTruthy();
  });

  test("rejects a username that starts with a digit", async () => {
    await expect(
      signupSchema.validate({ ...validSignup, username: "1jordan" })
    ).rejects.toThrow();
  });

  test("rejects a weak password missing a special character", async () => {
    await expect(
      signupSchema.validate({ ...validSignup, password: "Password1", confirmPassword: "Password1" })
    ).rejects.toThrow();
  });

  test("rejects mismatched confirm password", async () => {
    await expect(
      signupSchema.validate({ ...validSignup, confirmPassword: "Different1!" })
    ).rejects.toThrow();
  });

  test("allows contact number to be omitted, but validates it if present", async () => {
    await expect(
      signupSchema.validate({ ...validSignup, contactNumber: "12345" })
    ).rejects.toThrow();
    await expect(
      signupSchema.validate({ ...validSignup, contactNumber: "9876543210" })
    ).resolves.toBeTruthy();
  });
});

describe("taskSchema", () => {
  test("requires name, priority and deadline", async () => {
    await expect(taskSchema.validate({ name: "", priority: "", deadline: "" })).rejects.toThrow();
  });

  test("rejects a priority outside the allowed set", async () => {
    await expect(
      taskSchema.validate({ name: "Ship feature", priority: "urgent", deadline: "2026-10-01" })
    ).rejects.toThrow();
  });

  test("accepts a valid task", async () => {
    await expect(
      taskSchema.validate({ name: "Ship feature", priority: "high", deadline: "2026-10-01" })
    ).resolves.toBeTruthy();
  });
});
