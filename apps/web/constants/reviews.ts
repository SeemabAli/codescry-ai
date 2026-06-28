export const codeTypes = [
  {
    label: "React Component",
    value: "react-component",
  },
  {
    label: "Express Route",
    value: "express-route",
  },
  {
    label: "Express Controller",
    value: "express-controller",
  },
  {
    label: "Mongoose Model",
    value: "mongoose-model",
  },
  {
    label: "JavaScript Utility",
    value: "javascript-utility",
  },
] as const;

export const reviewModes = [
  {
    label: "Quick Review",
    value: "quick-review",
  },
  {
    label: "Deep Review",
    value: "deep-review",
  },
  {
    label: "Security Focused",
    value: "security-focused",
  },
  {
    label: "Performance Focused",
    value: "performance-focused",
  },
  {
    label: "Learning Mode",
    value: "learning-mode",
  },
] as const;

export const sampleCode = `app.post("/api/users", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});`;