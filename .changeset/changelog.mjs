/** @type {import('@changesets/types').ChangelogFunctions} */
const changelogFunctions = {
  async getReleaseLine(changeset) {
    const paragraphs = changeset.summary
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return paragraphs
      .map((paragraph) => {
        const [firstLine, ...rest] = paragraph
          .split("\n")
          .map((l) => l.trimEnd());
        return `- ${firstLine}${
          rest.length > 0 ? `\n${rest.map((l) => `  ${l}`).join("\n")}` : ""
        }`;
      })
      .join("\n");
  },

  async getDependencyReleaseLine(_changesets, dependenciesUpdated) {
    if (dependenciesUpdated.length === 0) return "";

    return [
      "- Updated dependencies",
      ...dependenciesUpdated.map((d) => `  - ${d.name}@${d.newVersion}`),
    ].join("\n");
  },
};

export default changelogFunctions;
