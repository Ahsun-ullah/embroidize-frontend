
const Schema = ({ product }) => {
  return (
    <pre id="debug-schema-output">
      {JSON.stringify(product, null, 2)}
    </pre>
  );
};

export default Schema;
