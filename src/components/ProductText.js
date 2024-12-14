import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Text } from 'grommet';

// give it slightly more prominence than regular text
const StyledText = styled(Text)`
  letter-spacing: 0.05em;
`;

const ProductText = ({ productName, vendor, ...rest }) => {
  const brandedProductName = useCallback(() => {

    let brandName = '';

    if (!productName) return '';

    // Make sure the productName doesn't already contain the vendor prefix
    if (productName.trimStart().startsWith(vendor)) brandName = productName;
    else brandName = `${vendor} ${productName}`;

    // use non-breaking variants of space '\xa0', a nd hyphen '\u2011'
    return brandName.replace(/ /g, '\xa0').replace(/-/g, '\u2011');
  }, [productName, vendor]);

  // update the web page title with productName
  useEffect(() => {
    document.title = brandedProductName();
  }, [brandedProductName]);

  if (!productName) return null;

return (
    <StyledText alignSelf="center" margin="none" {...rest}>
      {brandedProductName()}
    </StyledText>
  );
};

export default ProductText;
