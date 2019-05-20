/**
 * This file implements the props getter function to solve the Typescript
 * checking for React components with default properties.
 * 
 * Usage:
 *  type Props = {
 *    children: ReactNode
 *  } & Partial<DefaultProps>
 * 
 *  type DefaultProps = Readonly<typeof defaultProps>
 * 
 *  const defaultProps = {
 *    color: 'blue' as string
 *  }
 * 
 *  const getProps = createPropsGetter(defaultProps)
 * 
 *  class SomeClass extends React.Components<Props> {
 *    static defaultProps = defaultProps;
 *    render () {
 *      const {children, color} = getProps(this.props);
 *    }
 *  }
 * 
 * Reference: React, TypeScript and defaultProps dilemma
 *   https://medium.com/@martin_hotell/react-typescript-and-defaultprops-dilemma-ca7f81c661c7
 */

export const createPropsGetter = <DP extends object>(defaultProps:DP) => {
  return <P extends Partial<DP>>(props:P) => {
    // Extract default props from component Props API Type
    type PropsExcludingDefaults = Pick<P, Exclude<keyof P, keyof DP>>;
    // Re-create props definition by creating an intersection type
    // beteen Props without Defaults and NonNullable DefaultProps
    type RecomposedProps = DP & PropsExcludingDefaults;

    // Return the same props that we got as argument - identity function.
    // Turn off compiler and casting the type to our new RecomposedProps type.
    return (props as any) as RecomposedProps;
  }
}
