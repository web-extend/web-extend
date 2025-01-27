import { parse } from '@babel/parser';
import _traverse, { type NodePath } from '@babel/traverse';
import * as t from '@babel/types';

const traverse = typeof _traverse === 'function' ? _traverse : _traverse.default;

function astToObject(node: t.Node): unknown {
  if (t.isObjectExpression(node)) {
    return node.properties.reduce((obj: Record<string, unknown>, property) => {
      if (t.isObjectProperty(property)) {
        const key = t.isIdentifier(property.key) ? property.key.name : (property.key as t.StringLiteral).value;
        obj[key] = astToObject(property.value);
      }
      return obj;
    }, {});
  }
  if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node)) {
    return node.value;
  }
  if (t.isArrayExpression(node)) {
    return node.elements.map((element) => (element ? astToObject(element) : null));
  }
}

export function parseExportObject<T = unknown>(code: string, name: string): T | null {
  if (!code || !name) return null;
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let configValue = null;

  traverse(ast, {
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      const declaration = path.node.declaration;
      if (t.isVariableDeclaration(declaration)) {
        const declarator = declaration.declarations[0];
        if (t.isVariableDeclarator(declarator) && t.isIdentifier(declarator.id, { name }) && declarator.init) {
          configValue = astToObject(declarator.init);
        }
      }
    },
  });

  return configValue;
}
