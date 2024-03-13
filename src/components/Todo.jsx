import React, { useState, useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import "./style.css";
const Todo = () => {
  const listId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("All");
  const [lightMode, setLightMode] = useState(false);
  const filteredData = data.filter(item => {
    if (filter === "Active") {
      return !selected.includes(item.id);
    } else if (filter === "Completed") {
      return selected.includes(item.id);
    } else {
      return true;
    }
  });

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("text/plain", item.id);
  };

  // Function to handle the drag over event
  const handleDragOver = e => {
    e.preventDefault();
  };
  const [movedItem, setMovedItem] = useState(null);
  // Function to handle the drop event
  const handleDrop = (e, index) => {
    const draggedItemId = e.dataTransfer.getData("text/plain");
    const draggedItemIndex = data.findIndex(item => item.id === draggedItemId);

    // Create a new array with the updated order
    const updatedData = [...data];
    const [draggedItem] = updatedData.splice(draggedItemIndex, 1);
    updatedData.splice(index, 0, draggedItem);

    localStorage.setItem("todo", JSON.stringify(updatedData));
    setData(updatedData);

    setMovedItem({
      id: draggedItem.id,
      todo: draggedItem.todo,
      index: index,
    });
  };
  useEffect(() => {
    if (movedItem) {
      toast.success(`Item Moved Successfully - ${movedItem.todo}`, {
        icon: "🚀", // Add your success icon here
        style: {
          border: "2px solid #4CAF50",
          padding: "16px",
          color: "#4CAF50",
        },
      });
    }
  }, [movedItem]);
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("todo")) || [];
    setData(storedData);

    const storedSelected =
      JSON.parse(localStorage.getItem("selectedItems")) || [];
    setSelected(storedSelected);
  }, []);

  const onSubmit = item => {
    try {
      const newItem = {
        id: uuidv4(),
        todo: item.todo,
        completed: false,
      };
      const updatedData = [...data, newItem];
      localStorage.setItem("todo", JSON.stringify(updatedData));
      setData(updatedData);
      toast.success("Item Added Successfully");
      reset();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleDeleteItem = list => {
    try {
      const updatedData = data.filter(item => item.id !== list.id);
      localStorage.setItem("todo", JSON.stringify(updatedData));
      setData(updatedData);
      toast.success("Item Deleted Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleSelectedItem = list => {
    try {
      setSelected(prev => {
        const updatedSelected = prev.includes(list.id)
          ? prev.filter(id => id !== list.id)
          : [...prev, list.id];

        localStorage.setItem("selectedItems", JSON.stringify(updatedSelected));

        return updatedSelected;
      });
    } catch (error) {
      console.error("Error in handling selected item", error);
      toast.error("Error in handling selected item");
    }
  };

  const handleClearSelected = () => {
    try {
      if (selected.length > 0) {
        const updatedData = data.filter(item => !selected.includes(item.id));
        localStorage.setItem("todo", JSON.stringify(updatedData));
        setData(updatedData);
        setSelected([]);
        toast.success("Selected Item Cleared Successfully");
      } else {
        toast.error("Please select an item to clear");
      }
    } catch (error) {
      toast.error("Error in clearing selected item", error);
    }
  };

  const handleSwitchTheme = () => {
    setLightMode(prev => !prev);
  };
  const changeBodyBackgroundColor = () => {
    document.body.style.backgroundColor = lightMode ? "" : "white";
  };
  console.log("this is list:", data);
  return (
    <>
      <img
        src={
          lightMode
            ? "images/bg-desktop-light.jpg"
            : "images/bg-desktop-dark.jpg"
        }
        className="logo max-sm:h-[230px] max-w-2xl"
        alt=""
      />
      <section className="fixed top-0 left-0 w-full h-full flex justify-center  max-sm:w-screen items-center">
        <section className="w-[28rem] h-[30rem]  relative px-5  ">
          <div className="flex py-[1rem] max-sm:py-2 justify-between items-center w-[440px] max-sm:w-full text-white">
            <h1 className="text-3xl font-bold  tracking-[10px]">TODO</h1>
            <img
              src={lightMode ? "images/icon-moon.svg" : "images/icon-sun.svg"}
              className="sun h-6 cursor-pointer "
              alt=""
              onClick={() => {
                handleSwitchTheme();
                changeBodyBackgroundColor();
              }}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-text relative">
              <div className="circle h-5 w-5 rounded-full absolute z-10 ml-4  custom-shadow  top-[2.35rem]"></div>
              <input
                type="text"
                className={`input-user w-[450px] max-sm:w-full  h-[50px]  custom-shadow border-none outline-none pl-12 relative  rounded ${
                  lightMode
                    ? "bg-white text-[#6c6b8a]"
                    : "bg-[#25273c] text-white"
                }   mt-6`}
                placeholder="Create a new todo..."
                {...register("todo", { required: "This is required" })}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />
              <span className=" text-orange-400"> {errors?.todo?.message}</span>
            </div>
          </form>

          <div
            className={`list-notes  custom-shadow ${
              lightMode ? "bg-white " : ""
            } mt-8 rounded w-[450px] max-sm:w-full `}
          >
            {filteredData.length === 0 ? (
              <div className="h-10 text-red-500 pt-2 font-bold text-center  border-b   border-[#67808c] ">
                Sorry, no available!
              </div>
            ) : (
              <ul className="listOfNotes h-auto relative">
                {filteredData.map((list, index) => {
                  return (
                    <section
                      key={index}
                      className="relative pl-4 w-full  border-b   border-[#67808c] cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelectedItem(list)}
                      draggable // Enable draggable attribute
                      onDragStart={e => handleDragStart(e, list)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, index)}
                    >
                      <section className="flex items-center justify-center gap-3">
                        {selected.includes(list.id) ? (
                          <img
                            src="/images/checked.png "
                            className="h-5 w-5  mb-1 rounded-full "
                          />
                        ) : (
                          <div className="h-5 w-5 mb-1 rounded-full list-circle border-[#4b4c5e] border"></div>
                        )}
                        <li
                          className={` select-none ${
                            lightMode && "text-black"
                          } ${
                            selected.includes(list.id) ? " line-through" : ""
                          }`}
                        >
                          {list.todo}
                        </li>
                      </section>
                      <img
                        src="/images/icon-cross.svg"
                        className={`h-3 pr-5 cursor-pointer" ${
                          lightMode && "invert"
                        }`}
                        alt=""
                        onClick={() => handleDeleteItem(list)}
                      />
                    </section>
                  );
                })}
              </ul>
            )}

            <div
              className={`${
                lightMode && "text-black"
              } bottom-content w-[450px]  max-sm:w-full flex max-sm:justify-between gap-12 text-xs pl-4 py-4 cursor-pointer text-white`}
            >
              <div
                className={` flex w-[100px]  select-none ${
                  lightMode ? "text-black" : ""
                } `}
              >
                <span className=" mr-2"> </span>
                <p className="">
                  {filter === "All"
                    ? `${data.length} items left` // No change here
                    : filter === "Active"
                    ? `${
                        data.filter(item => !selected.includes(item.id)).length
                      } items left` // Use filtered data length
                    : `${
                        data.filter(item => selected.includes(item.id)).length
                      } items left`}{" "}
                </p>
              </div>
              <div
                className={` max-sm:hidden flex gap-4 ${
                  lightMode ? "text-black" : ""
                }`}
              >
                <p
                  onClick={() => setFilter("All")}
                  className={`select-none ${
                    filter === "All" ? "text-red-500 " : ""
                  }`}
                >
                  All
                </p>
                <p
                  onClick={() => setFilter("Active")}
                  className={`select-none ${
                    filter === "Active" ? "text-red-500 " : ""
                  }`}
                >
                  Active
                </p>
                <p
                  onClick={() => setFilter("Completed")}
                  className={`select-none ${
                    filter === "Completed" ? "text-red-500 " : ""
                  }`}
                >
                  Completed
                </p>
              </div>
              <div>
                <p
                  className={`clear max-sm:text-center  max-sm:mr-3 ${
                    lightMode ? "text-black" : ""
                  }`}
                  onClick={handleClearSelected}
                >
                  Clear Completed
                </p>
              </div>
            </div>
          </div>
          <div
            className={` max-:sm:visible  sm:hidden  w-[450px] max-sm:w-full  mt-5 h-10 text-center rounded-md cursor-pointer  items-center justify-center custom-shadow flex gap-4 ${
              lightMode ? "text-black " : "text-[#bfc1d4] bg-[#25273c]"
            }`}
          >
            <p
              onClick={() => setFilter("All")}
              className={`select-none ${
                filter === "All" ? "text-red-500 " : ""
              }`}
            >
              All
            </p>
            <p
              onClick={() => setFilter("Active")}
              className={`select-none ${
                filter === "Active" ? "text-red-500 " : ""
              }`}
            >
              Active
            </p>
            <p
              onClick={() => setFilter("Completed")}
              className={`select-none ${
                filter === "Completed" ? "text-red-500 " : ""
              }`}
            >
              Completed
            </p>
          </div>
          <div className="text-sm  mt-10 mb-20 ml-5 text-center text-[#959bb0]">
            {" "}
            Drag and drop to reorder list
          </div>
        </section>
      </section>

      <Toaster position="top-right" reverseOrder="true" />
    </>
  );
};

export default Todo;
