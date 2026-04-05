export interface PageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * 根据content可见高度自适应
   */
  autoContentHeight?: boolean;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
  /**
   * 与 autoContentHeight 配合：内容区不整体纵向滚动，由内部（如表格 body）自行滚动，
   * 便于搜索区与分页条常驻可视区域。
   */
  contentStableLayout?: boolean;
}
