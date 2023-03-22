import { ReactElement, ReactNode } from 'react'

type Props<TChildren extends ReactNode> = {
	children: TChildren
	handleOnSubmit: (
		props: TChildren extends ReactElement<{ name: string; value: unknown }>[]
			? {
					[name in TChildren[number]['props']['name']]: TChildren[number]['props']['value']
			  }
			: never,
	) => void
}

const Form3 = <TP extends Record<string, unknown>[]>({
	children,
}: Props<
	ReactElement<{
		name: keyof TP[number]
		value: TP[number][keyof TP[number]]
	}>[]
>) => {
	return <form>{children}</form>
}

const Form3_2 = <TChildren,>(
	props: TChildren extends ReactElement<{ name: string; value: unknown }>[]
		? Props<TChildren>
		: undefined,
) => {
	if (!props) return <></>

	return <form>{props.children}</form>
}

export default Form3

const FormField = <const TName extends string, TValue>(
	props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> & {
		name: TName
		value: TValue
		testFN?: (name: TName, value: TValue) => void
	},
) => {
	return <input {...props} />
}

const TestComponent = () => {
	return (
		<>
			<Form3
				handleOnSubmit={(values) => {
					values
					const L = values.L
					const W = values.W
					L
					W
				}}
			>
				<FormField
					name='L'
					value={3}
					testFN={(name, value) => {
						name
						value
					}}
				/>
				<FormField
					name='W'
					value='8'
					testFN={(name, value) => {
						name
						value
					}}
				/>
			</Form3>

			<Form3_2
				handleOnSubmit={(values) => {
					values
					const L = values.L
					const W = values.W
					L
					W
				}}
			>
				<FormField
					name='L'
					value={3}
					testFN={(name, value) => {
						name
						value
					}}
				/>
				<FormField
					name='W'
					value='8'
					testFN={(name, value) => {
						name
						value
					}}
				/>
			</Form3_2>
		</>
	)
}
