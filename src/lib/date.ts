import moment from "moment";

export const getRelativeDate = (date: string | Date) => {
  const today = moment().startOf("day");
  const inputDate = moment(date).startOf("day");

  const diffDays = today.diff(inputDate, "days");

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return inputDate.format("DD/MM/YYYY");
  }
};
