import { ProTable, ProTableProps } from "@ant-design/pro-components";

interface AntProTableProps<T extends object, U extends Record<string, any>> extends ProTableProps<T, U> { }

const AntProTable = <T extends object, U extends Record<string, any>>({
    scroll,
    ...rest
}: AntProTableProps<T, U>) => {
    // Default scroll settings; these will be merged with any scroll prop passed in
    const defaultScroll = { x: 1200 };
    const mergedScroll = { ...defaultScroll, ...scroll };

    return <ProTable {...rest} scroll={mergedScroll} />;
};

export default AntProTable;
