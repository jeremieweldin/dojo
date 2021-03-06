import { DownCircleOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import React from 'react';

interface Props {
	text: string | JSX.Element;
	disabled: boolean;
}

export default class Expander extends React.Component<Props> {
	public static defaultProps = {
		disabled: false
	};

	public render() {
		try {
			let style = 'expander';
			if (this.props.disabled) {
				style += ' disabled';
			}

			return (
				<Collapse
					className={style}
					bordered={false}
					defaultActiveKey={[]}
					expandIcon={p => <DownCircleOutlined rotate={p.isActive ? -180 : 0} />}
					expandIconPosition={'right'}
				>
					<Collapse.Panel key='one' header={<div className='collapse-header-text'>{this.props.text}</div>}>
						{this.props.children}
					</Collapse.Panel>
				</Collapse>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}
