import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { i18n } = require("./next-i18next.config");

const nextConfig: NextConfig = {
  // Empty config or other settings
};

export default nextConfig;
