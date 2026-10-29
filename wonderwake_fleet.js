/* Homeport: public ship metadata only. No network, storage or account authority. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WWFleet=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const description={schema:'blackflag-public-learning-vessel-v1',vessel:'wonderwake',name:'Wonderwake',version:'0.2.0',release:'Homeport',fleet:'Black Flag',role:'independent-learning-vessel',lifecycle:'family-preview',commissioned:false,live_health_verified:false,learner_data_included:false,automatic_transfer:false,complete_k12:false,production_origin_isolation_verified:false,capabilities:[
{id:'save-readback-v1',direction:'fleet-to-ship',summary:'Report a save only after transaction completion and separate readback.',transfer:'review-and-adopt'},
{id:'explicit-scope-v1',direction:'fleet-to-ship',summary:'Stable learner identity; explicit selection; no inherited authority.',transfer:'review-and-adopt'},
{id:'creative-touch-v1',direction:'ship-to-fleet',summary:'Touch-first shape placement, mirroring and independent creations; candidate for review.',transfer:'review-and-adopt'},
{id:'honest-coverage-v1',direction:'ship-to-fleet',summary:'Keep practice progress separate from curriculum coverage and certified mastery.',transfer:'review-and-adopt'}]};
return Object.freeze({version:'0.2.0',engineURL:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',passport:function(){return JSON.parse(JSON.stringify(description));}});
});
