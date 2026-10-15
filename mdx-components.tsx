import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mdx-heading" {...props} />,
    a: (props) => <a className="mdx-link" {...props} />,
    ...components,
  };
}
