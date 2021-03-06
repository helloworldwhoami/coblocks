/**
 * External dependencies
 */
import classnames from 'classnames';
import filter from 'lodash/filter';
import { GalleryOffsetIcon as icon } from '@godaddy-wordpress/coblocks-icons';

/**
 * Internal dependencies
 */
import GalleryImage from '../../components/block-gallery/gallery-image';
import GalleryPlaceholder from '../../components/block-gallery/gallery-placeholder';
import Inspector from './inspector';
import Controls from './controls';
import { GalleryClasses } from '../../components/block-gallery/shared';
import GutterWrapper from '../../components/gutter-control/gutter-wrapper';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { withNotices, Icon } from '@wordpress/components';

/**
 * Block edit function
 *
 * @param oldIndex
 * @param index
 * @param attributes
 * @param newIndex
 */
class Edit extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			selectedImage: null,
		};
	}

	componentDidMount() {
		if ( this.props.wideControlsEnabled === true && ! this.props.attributes.align ) {
			this.props.setAttributes( {
				align: 'wide',
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		// Deselect images when deselecting the block
		if ( ! this.props.isSelected && prevProps.isSelected ) {
			this.setState( {
				selectedImage: null,
				captionSelected: false,
			} );
		}
	}

	onMove = ( oldIndex, newIndex ) => {
		const images = [ ...this.props.attributes.images ];
		images.splice( newIndex, 1, this.props.attributes.images[ oldIndex ] );
		images.splice( oldIndex, 1, this.props.attributes.images[ newIndex ] );
		this.setState( { selectedImage: newIndex } );
		this.props.setAttributes( { images } );
	}

	onMoveForward = ( oldIndex ) => {
		return () => {
			if ( oldIndex === this.props.attributes.images.length - 1 ) {
				return;
			}
			this.onMove( oldIndex, oldIndex + 1 );
		};
	}

	onMoveBackward = ( oldIndex ) => {
		return () => {
			if ( oldIndex === 0 ) {
				return;
			}
			this.onMove( oldIndex, oldIndex - 1 );
		};
	}

	onSelectImage = ( index ) => {
		return () => {
			if ( this.state.selectedImage !== index ) {
				this.setState( {
					selectedImage: index,
				} );
			}
		};
	}

	onRemoveImage = ( index ) => {
		return () => {
			const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
			this.setState( { selectedImage: null } );
			this.props.setAttributes( {
				images,
			} );
		};
	}

	setImageAttributes = ( index, attributes ) => {
		const { attributes: { images }, setAttributes } = this.props;
		if ( ! images[ index ] ) {
			return;
		}
		setAttributes( {
			images: [
				...images.slice( 0, index ),
				{
					...images[ index ],
					...attributes,
				},
				...images.slice( index + 1 ),
			],
		} );
	}

	render() {
		const {
			attributes,
			className,
			isSelected,
			noticeUI,
		} = this.props;

		const {
			animation,
			captions,
			images,
			linkTo,
			lightbox,
			gridSize,
		} = attributes;

		const hasImages = !! images.length;

		const offsetGalleryPlaceholder = (
			<Fragment>
				{ ! hasImages ? noticeUI : null }
				<GalleryPlaceholder
					{ ...this.props }
					label={ __( 'Offset', 'coblocks' ) }
					icon={ <Icon icon={ icon } /> }
				/>
			</Fragment>
		);

		if ( ! hasImages ) {
			return offsetGalleryPlaceholder;
		}

		const wrapperClasses = classnames(
			className, {
				'has-lightbox': lightbox,
			}
		);

		const innerClasses = classnames(
			...GalleryClasses( attributes ), {
				[ `has-${ gridSize }-images` ]: gridSize,
			}
		);

		const itemClasses = classnames(
			'coblocks-gallery--item', {
				[ `coblocks-animate ${ animation }` ]: animation,
			}
		)

		return (
			<Fragment>
				<Controls { ...this.props } />
				<Inspector
					{ ...this.props }
				/>
				{ noticeUI }
				<div className={ wrapperClasses }>
					<GutterWrapper { ...attributes }>
						<ul className={ innerClasses }>
							{ images.map( ( img, index ) => {
								const ariaLabel = sprintf(
									/* translators: %1$d is the order number of the image, %2$d is the total number of images */
									__( 'image %1$d of %2$d in gallery', 'coblocks' ),
									( index + 1 ),
									images.length
								);

								return (
									<li className={ itemClasses } key={ img.id || img.url }>
										<GalleryImage
											url={ img.url }
											alt={ img.alt }
											id={ img.id }
											isSelected={ isSelected && this.state.selectedImage === index }
											onRemove={ this.onRemoveImage( index ) }
											onSelect={ this.onSelectImage( index ) }
											setAttributes={ ( attrs ) => this.setImageAttributes( index, attrs ) }
											caption={ img.caption }
											aria-label={ ariaLabel }
											captions={ captions }
											supportsCaption={ true }
											imgLink={ img.imgLink }
											linkTo={ linkTo }
											isFirstItem={ index === 0 }
											isLastItem={ ( index + 1 ) === images.length }
											onMoveBackward={ this.onMoveBackward( index ) }
											onMoveForward={ this.onMoveForward( index ) }
											newClass="wp-block-coblocks-gallery-offset__figure"
										/>
									</li>
								);
							} ) }
						</ul>
					</GutterWrapper>
					{ offsetGalleryPlaceholder }
				</div>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select ) => ( {
		wideControlsEnabled: select( 'core/editor' ).getEditorSettings().alignWide,
	} ) ),
	withNotices,
] )( Edit );
