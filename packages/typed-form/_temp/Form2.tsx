import React, {
	Children,
	ComponentLifecycle,
	Component,
	// JSXElementConstructor,
	Key,
	// ReactElement
} from 'react';

// interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> { }

type JSXElementConstructor<P> =
	| ((props: P) => ReactElement<unknown, any> | null)
	| (new (props: P) => Component<unknown, unknown>);

interface ReactElement<
	P = unknown,
	T extends string | JSXElementConstructor<unknown> =
		| string
		| JSXElementConstructor<unknown>,
> {
	type: T;
	props: P;
	key: Key | null;
}

type Props<TChildren extends ReactElement<unknown>[]> = {
	children: TChildren;
	handleSubmit: (
		children: TChildren,
		props: TChildren[number]['props'] extends { name: string; value: unknown }
			? TChildren[number]['props']
			: never,
		// values: Record<
		// 	TChildren[number]['props']['name'],
		// 	TChildren[number]['props']['value']
		// >,
	) => void;
};

function Form3<children extends ReactElement<unknown>[]>({
	children,
}: Props<children>) {
	const childProps = Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			return child.props;
		}
		return null;
	});

	// Now you can use `childProps` to infer the attributes of the children

	return <form>{children}</form>;
}

const predicate = (
	child: React.ReactNode,
): child is React.ReactElement<{ __TYPE: 'Trigger' }> =>
	React.isValidElement(child) ? child.props.__TYPE === 'Trigger' : false;

const TestComponent = () => {
	return (
		<Form3
			handleSubmit={(children, props) => {
				children[0].props.name;
				props;
			}}
		>
			<input name='lol' value='BRUH' />
			<input name='lol' value='BRUH' />
		</Form3>
	);
};
