import G6 from '@antv/g6';

const G6_render = (data, id) => {

      const graph = new G6.Graph({
        container: `${id}`, 
        width: 980,
        height: 280,
        fitViewPadding: [20, 50, 50, 20],
        defaultNode: {
          size:60,
          type:'rect',
          style: {
            fill: '#E5DDD7',
            stroke: '#F3F0E7',
            lineWidth: 2,
          },
        },
        defaultEdge: {
          style: {
            endArrow: true,
          },
          color: '#DDD0C8',
          size:2.5,
        }
      });

      // 读取数据
      graph.data(data);
      // 渲染图
      graph.render();

      return graph;
}

export default G6_render;