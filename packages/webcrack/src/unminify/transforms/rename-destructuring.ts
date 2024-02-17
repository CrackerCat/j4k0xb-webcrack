import * as m from '@codemod/matchers';
import { renameCarefully, type Transform } from '../../ast-utils';

export default {
  name: 'rename-destructuring',
  tags: ['safe'],
  scope: true,
  visitor() {
    const key = m.capture(m.anyString());
    const alias = m.capture(m.anyString());
    const matcher = m.objectProperty(
      m.identifier(key),
      m.or(m.identifier(alias), m.assignmentPattern(m.identifier(alias))),
    );

    return {
      ObjectPattern: {
        exit(path) {
          for (const property of path.node.properties) {
            if (!matcher.match(property)) continue;
            const binding = path.scope.getBinding(alias.current!);
            if (!binding) continue;

            renameCarefully(binding, key.current!);
            property.shorthand = true;
          }
        },
      },
    };
  },
} satisfies Transform;
