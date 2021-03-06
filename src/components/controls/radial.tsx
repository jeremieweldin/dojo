import { ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, ArrowUpOutlined } from '@ant-design/icons';
import React from 'react';

interface Props {
	mode: 'four' | 'eight';
	disabled: boolean;
	onClick: (dir: string) => void;
}

export default class Radial extends React.Component<Props> {
	public static defaultProps = {
		mode: 'eight',
		disabled: false
	};

	private click(e: React.MouseEvent, dir: string) {
		e.stopPropagation();
		this.props.onClick(dir);
	}

	public render() {
		try {
			let style = 'radial ' + this.props.mode;
			if (this.props.disabled) {
				style += ' disabled';
			}

			const showDiag = (this.props.mode === 'eight');

			return (
				<div className={style}>
					<div className='cell' style={{ display: showDiag ? 'none' : 'inline-block' }} />
					<div className='cell' style={{ display: showDiag ? 'inline-block' : 'none' }}>
						<div className='arrow diag' onClick={e => this.click(e, 'NW')}>
							<ArrowUpOutlined rotate={-45} />
						</div>
					</div>
					<div className='cell'>
						<div className='arrow vertical' onClick={e => this.click(e, 'N')}>
							<ArrowUpOutlined />
						</div>
					</div>
					<div className='cell' style={{ display: showDiag ? 'none' : 'inline-block' }} />
					<div className='cell' style={{ display: showDiag ? 'inline-block' : 'none' }}>
						<div className='arrow diag' onClick={e => this.click(e, 'NE')}>
							<ArrowUpOutlined rotate={45} />
						</div>
					</div>
					<div className='cell'>
						<div className='arrow horizontal' onClick={e => this.click(e, 'W')}>
							<ArrowLeftOutlined />
						</div>
					</div>
					<div className='cell' />
					<div className='cell'>
						<div className='arrow horizontal' onClick={e => this.click(e, 'E')}>
							<ArrowRightOutlined />
						</div>
					</div>
					<div className='cell' style={{ display: showDiag ? 'none' : 'inline-block' }} />
					<div className='cell' style={{ display: showDiag ? 'inline-block' : 'none' }}>
						<div className='arrow diag' onClick={e => this.click(e, 'SW')}>
							<ArrowDownOutlined rotate={45} />
						</div>
					</div>
					<div className='cell'>
						<div className='arrow vertical' onClick={e => this.click(e, 'S')}>
							<ArrowDownOutlined />
						</div>
					</div>
					<div className='cell' style={{ display: showDiag ? 'none' : 'inline-block' }} />
					<div className='cell' style={{ display: showDiag ? 'inline-block' : 'none' }}>
						<div className='arrow diag' onClick={e => this.click(e, 'SE')}>
							<ArrowDownOutlined rotate={-45} />
						</div>
					</div>
				</div>
			);

		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}
