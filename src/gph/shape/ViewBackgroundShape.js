const zrender = require('zrender')

// eslint-disable-next-line no-unused-vars
const linearColor = new zrender.LinearGradient(0, 0, 0, 1, [
    {
        offset: 0,
        color: '#efe3ff'
    },
    {
        offset: 1,
        color: '#6cb3e9'
    }
]);

const errColor = new zrender.LinearGradient(0, 0, 0, 1, [
    {
        offset: 1,
        color: '#9a0851'
    },
    {
        offset: 0,
        color: '#244a7a'
    }
]);



class ViewBackgroundShape extends zrender.Path{
    constructor(options) {

        options.draggable = false
        options.style.fill = errColor

        options.style.strokeNoScale = true
        options.style.stroke = '#0d1e34'

        // eslint-disable-next-line no-debugger
        super(options);
        this.state ='normal'
        this.name = options.name;
    }

    // eslint-disable-next-line no-unused-vars
    buildPath(ctx, shapeCfg, inBatch){

        ctx.fillStyle = this.getFillColor()
        ctx.rect(this.x,this.y,this.width,this.height)

    }

    getFillColor() {
        switch(this.state){
            case 'normal':
                return linearColor
            case 'error':
                return  errColor
            default:
                return linearColor
        }
    }
    setState(state) {
        this.state = state
    }
}


export default ViewBackgroundShape
