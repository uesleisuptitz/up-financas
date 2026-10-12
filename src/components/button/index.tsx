import {
  Button as MuiButton,
  ButtonProps,
  CircularProgress,
} from "@mui/material";

interface Props extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const Button = (props: Props) => {
  const { loading = false, loadingText, children, endIcon, ...rest } = props;

  return (
    <MuiButton
      {...rest}
      disabled={rest.disabled || loading}
      endIcon={
        loading ? <CircularProgress size="0.8rem" color="inherit" /> : endIcon
      }
    >
      {loading ? loadingText || children : children}
    </MuiButton>
  );
};

export default Button;
