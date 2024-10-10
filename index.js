const plugin = (opts = {}) => {
  return {
    postcssPlugin: "postcss-diff-custom-properties",
    Once(root, { result }) {
      const { baseCSS, newCSS, outputReport } = opts;

      if (!baseCSS || !newCSS) {
        throw new Error("Both 'baseCSS' and 'newCSS' options are required.");
      }

      // Helper function to extract custom properties from CSS root
      const extractCustomProperties = (cssRoot) => {
        const customProperties = {};
        cssRoot.walkDecls((decl) => {
          if (decl.prop.startsWith("--")) {
            customProperties[decl.prop] = decl.value;
          }
        });
        return customProperties;
      };

      const baseProperties = extractCustomProperties(baseCSS);
      const newProperties = extractCustomProperties(newCSS);

      const diff = {
        added: {},
        removed: {},
        changed: {},
      };

      // Compare base and new CSS custom properties
      Object.keys(baseProperties).forEach((prop) => {
        if (!(prop in newProperties)) {
          diff.removed[prop] = baseProperties[prop];
        } else if (baseProperties[prop] !== newProperties[prop]) {
          diff.changed[prop] = {
            from: baseProperties[prop],
            to: newProperties[prop],
          };
        }
      });

      Object.keys(newProperties).forEach((prop) => {
        if (!(prop in baseProperties)) {
          diff.added[prop] = newProperties[prop];
        }
      });

      // Output the diff report
      if (typeof outputReport === "function") {
        outputReport(diff);
      } else {
        result.messages.push({
          type: "diff-report",
          plugin: "postcss-diff-custom-properties",
          diff: diff,
        });
      }
    },
  };
};

plugin.postcss = true;

export default plugin;
