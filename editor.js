( function ( wp ) {
    'use strict';
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var components = wp.components;

    function Assistant() {
        var topicState = useState( '' ), topic = topicState[ 0 ], setTopic = topicState[ 1 ];
        var textState = useState( '' ), source = textState[ 0 ], setSource = textState[ 1 ];
        var taskState = useState( 'outline' ), task = taskState[ 0 ], setTask = taskState[ 1 ];
        var toneState = useState( 'clear' ), tone = toneState[ 0 ], setTone = toneState[ 1 ];
        var suggestionState = useState( '' ), suggestion = suggestionState[ 0 ], setSuggestion = suggestionState[ 1 ];
        var errorState = useState( '' ), error = errorState[ 0 ], setError = errorState[ 1 ];
        var busyState = useState( false ), busy = busyState[ 0 ], setBusy = busyState[ 1 ];
        var statusState = useState( '' ), status = statusState[ 0 ], setStatus = statusState[ 1 ];

        function generate() {
            var postId = wp.data.select( 'core/editor' ).getCurrentPostId();
            if ( ! postId ) { setError( 'Save this post as a draft first.' ); return; }
            setBusy( true ); setError( '' ); setStatus( '' ); setSuggestion( '' );
            wp.apiFetch( {
                path: '/wp-ai-content-assistant/v1/suggest', method: 'POST',
                data: { post_id: postId, task: task, topic: topic, text: source, tone: tone }
            } ).then( function ( response ) {
                setSuggestion( response.suggestion || '' );
            } ).catch( function ( failure ) {
                setError( failure.message || 'Could not generate a suggestion.' );
            } ).finally( function () { setBusy( false ); } );
        }

        function insert() {
            if ( ! suggestion ) { return; }
            var paragraphs = suggestion.split( /\n\s*\n|\n/ ).map( function ( line ) { return line.trim(); } ).filter( Boolean );
            var blocks = paragraphs.map( function ( line ) {
                return wp.blocks.createBlock( 'core/paragraph', { content: line } );
            } );
            var editor = wp.data.dispatch( 'core/block-editor' );
            if ( editor && editor.insertBlocks ) {
                editor.insertBlocks( blocks );
                setStatus( 'Inserted into the post. Review and edit before publishing.' );
            } else { setError( 'The block editor is unavailable.' ); }
        }

        return el( wp.editPost.PluginSidebar, { name: 'wpaica-sidebar', title: 'AI Content Assistant', icon: 'edit' },
            el( 'div', { className: 'wpaica-panel' },
                el( 'p', null, 'Create a suggestion, review it, then insert it into your draft.' ),
                el( components.SelectControl, { label: 'Action', value: task, options: [
                    { label: 'Article outline', value: 'outline' }, { label: 'Introduction', value: 'intro' },
                    { label: 'Improve writing', value: 'improve' }, { label: 'Summarize text', value: 'summary' }
                ], onChange: setTask } ),
                el( components.TextControl, { label: 'Topic', value: topic, maxLength: 500, onChange: setTopic, help: 'Required unless you provide text below.' } ),
                el( components.TextareaControl, { label: 'Text to work with', value: source, rows: 7, maxLength: 6000, onChange: setSource, help: 'Required for Improve writing and Summarize text. Sent to your configured AI provider.' } ),
                el( components.SelectControl, { label: 'Tone', value: tone, options: [
                    { label: 'Clear', value: 'clear' }, { label: 'Friendly', value: 'friendly' }, { label: 'Professional', value: 'professional' }
                ], onChange: setTone } ),
                el( components.Button, { variant: 'primary', isBusy: busy, disabled: busy, onClick: generate }, busy ? 'Generating…' : 'Generate suggestion' ),
                error && el( components.Notice, { status: 'error', isDismissible: false }, error ),
                status && el( components.Notice, { status: 'success', isDismissible: false }, status ),
                suggestion && el( 'div', { className: 'wpaica-preview' },
                    el( 'h3', null, 'Suggestion' ),
                    el( 'pre', null, suggestion ),
                    el( components.Button, { variant: 'secondary', onClick: insert }, 'Insert into post' )
                )
            )
        );
    }
    wp.plugins.registerPlugin( 'wpaica', { render: Assistant } );
} )( window.wp );
