import { Button } from 'ui'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import React from 'react'

export default function Web() {
	return (
		<div>
			<h1 className='h-full w-full text-3xl  font-bold underline'>
				Hello world!
			</h1>
			<Button />
		</div>
	)
}
