const path = require('path');
const camelCase = require('camelcase');

module.exports = {
  process: (src, filename) => {
    const assetFileName = JSON.stringify(path.basename(filename));
    if (filename.match(/\.svg$/)) {
      const pascalCaseFileName = camelCase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFileName}`;
      return `const React = require('react');
      module.exports = {
        __esModule: true,
        default: ${assetFileName},
        ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: ref,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFileName}
            })
          };
        }),
      };`;
    }
    return `module.exports = ${assetFileName};`
  },
};
