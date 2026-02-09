export const validateSignup = ({ name, email, password }) => {
  if (!name || !email || !password) {
    return "Name, email and password are required";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/;

  if (!passwordRegex.test(password)) {
    return (
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    );
  }

  return null;
};