/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { useAsyncList } from '@wordpress/compose';
import { Button, Spinner } from '@wordpress/components';
import { BlockPreview } from '@wordpress/block-editor';
import { applyFilters } from '@wordpress/hooks';

/**
 * Render the layout previews into columns.
 */
export const LayoutSelectorResults = ( { layouts, category, onInsert } ) => {
	const filteredLayouts = useMemo(
		() => layouts
			.filter( ( layout ) => layout.category === category )
			.map( ( layout ) => ( { ...layout,
				/**
				 * Filters the list of blocks within the layout preview.
				 *
				 * @param {Array} blocks The block objects of the layout.
				 */
				blocks: applyFilters( 'coblocks.layoutPreviewBlocks', layout.blocks ),
			} ) ),
		[ layouts, category ]
	);

	// Needed to render our list of previews asynchronously for better performance.
	const currentShowLayouts = useAsyncList( filteredLayouts );

	const chunkedLayoutsList = [ [], [] ];
	filteredLayouts.forEach( ( layout, index ) => chunkedLayoutsList[ index % 2 ].push( layout ) );

	return category && !! filteredLayouts.length
		? (
			<div className="coblocks-layout-selector__layouts">
				{ chunkedLayoutsList.map(
					( theLayouts, columnIndex ) => (
						<div key={ columnIndex } className="coblocks-layout-selector__layouts-column">
							<LayoutPreviewList
								layouts={ theLayouts }
								shownLayouts={ currentShowLayouts }
								onClickLayout={ onInsert }
							/>
						</div>
					)
				) }
			</div>
		)
		: ( <p><em>{ __( 'No layouts are available for this category.', 'coblocks' ) }</em></p> );
};

/**
 * Renders the layout's block preview.
 */
export const LayoutPreview = ( { layout, onClick } ) => {
	const [ overlay, setOverlay ] = useState( false );

	return (
		<Button
			className={ classnames( 'coblocks-layout-selector__layout' ) }
			onClick={ () => onClick( layout ) }
			onMouseEnter={ () => setOverlay( true ) }
			onMouseLeave={ () => setOverlay( false ) }>

			<div className={ classnames( 'coblocks-layout-selector__layout--overlay', { 'is-active': overlay } ) }>
				{ __( 'Select Layout', 'coblocks' ) }
			</div>

			<BlockPreview blocks={ layout.blocks } viewportWidth={ 700 } />
		</Button>
	);
};

/**
 * Renders the layout's loading placeholder.
 */
const LayoutPreviewPlaceholder = () => {
	return (
		<div className="coblocks-layout-selector__layout is-placeholder">
			<Spinner />
		</div>
	);
};

/**
 * Renders a list of previews for the layouts passed. Placeholders rendered
 * for components not yet loaded async via `shownLayouts`.
 */
export const LayoutPreviewList = ( { layouts, shownLayouts, onClickLayout } ) => {
	return layouts.map( ( layout, index ) => {
		const isShown = shownLayouts.includes( layout );
		return isShown
			? (
				<LayoutPreview
					key={ index }
					layout={ layout }
					onClick={ onClickLayout }
				/>
			)
			: (
				<LayoutPreviewPlaceholder key={ index } />
			);
	} );
};
