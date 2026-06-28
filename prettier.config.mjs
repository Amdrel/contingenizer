/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
    importOrder: ["^@/(.*)$", "^[./]"],
    printWidth: 80,
    tabWidth: 4,
    trailingComma: "all",
};
