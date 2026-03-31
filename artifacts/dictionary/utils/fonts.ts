import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const fonts = {
  regular: isWeb ? undefined : 'Inter_400Regular',
  medium: isWeb ? undefined : 'Inter_500Medium',
  semiBold: isWeb ? undefined : 'Inter_600SemiBold',
  bold: isWeb ? undefined : 'Inter_700Bold',
};
