import React from 'react';

import { Icon } from 'antd';

interface Props {
    openMenu: () => void;
    openDrawer: (type: string) => void;
}

export default class PageHeader extends React.Component<Props> {
    public render() {
        /*
        try {
        */
            return (
                <div className='page-header'>
                    <Icon type='menu' className='menu-icon' onClick={() => this.props.openMenu()} title='menu' />
                    <div className='app-title app-name'>dojo</div>
                    <div className='drawer-icons'>
                        <Icon type='search' className='title-bar-icon' onClick={() => this.props.openDrawer('search')} title='search' />
                        <Icon type='setting' className='title-bar-icon' onClick={() => this.props.openDrawer('tools')} title='dm tools' />
                        <Icon type='info-circle' className='title-bar-icon' onClick={() => this.props.openDrawer('about')} title='about' />
                    </div>
                </div>
            );
        /*
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
        */
    }
}