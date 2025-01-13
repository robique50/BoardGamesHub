import { DestructiveButton, PrimaryButton } from "@/components/forms/Buttons";
import { Form } from "@/components/forms/Form";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { H1 } from "@/components/ui/Headings";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiMiniMinusCircle, HiMiniPlusCircle } from "react-icons/hi2";
import { array, number, object, string } from "yup";
import { useAuthContext } from "../Auth/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const validationSchema = object({
  bggId: number().required().min(0),
  name: string().required(),
  thumbnail: string().url(),
  image: string().url(),
  alternateNames: array(string()),
  description: string().required(),
  numberOfPlayers: object({
    min: number(),
    max: number(),
    recommended: number(),
    best: number(),
  }),
  playtime: object({
    avg: number(),
    min: number(),
    max: number(),
  }),
  minAge: number(),
  yearpublished: number(),
  rank: number(),
  bayesaverage: number(),
  average: number(),
  usersrated: number(),
  otherRanks: object({
    strategygames: number(),
    thematic: number(),
  }),
});

const apiUrl = import.meta.env.VITE_API_URL;

export function EditGame() {
  const [boardgame, setBoardgame] = useState(null);
  const [numberOfAlternateNames, setNumberOfAlternateNames] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();

  const { accessToken } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: async () =>
      fetch(`${apiUrl}/boardgames/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setBoardgame(data);
          setNumberOfAlternateNames(data.alternateNames.length);
          return data;
        }),
  });

  async function handleUpdateGame(updatedGame) {
    try {
      const response = await fetch(`${apiUrl}/boardgames/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedGame),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update game");
      }

      toast.success(`"${data.name}" was updated successfully.`);
      navigate(`/boardgames/${id}`);
    } catch (error) {
      toast.error(error.message || "Failed to update game");
    }
  }

  if (!boardgame) {
    return <strong>Loading ...</strong>;
  }

  return (
    <>
      <H1>Editing {boardgame.name}</H1>
      <Form onSubmit={handleSubmit(handleUpdateGame)}>
        <Input
          labelText="BGG Id"
          type="number"
          errorMessage={errors.bggId?.message}
          {...register("bggId")}
        />
        <Input
          labelText="Title"
          type="text"
          errorMessage={errors.name?.message}
          {...register("name")}
        />
        <Input
          labelText="Thumbnail"
          type="url"
          errorMessage={errors.thumbnail?.message}
          {...register("thumbnail")}
        />
        <Input
          labelText="Image"
          type="url"
          errorMessage={errors.image?.message}
          {...register("image")}
        />
        <div className="grid grid-cols-[150px,_1fr,_1fr] gap-1 col-start-2 border border-slate-200 rounded">
          {new Array(numberOfAlternateNames).fill().map((_, i) => (
            <>
              <Input
                key={i}
                labelText="Alternate Name"
                type="text"
                errorMessage={errors.alternateNames?.message}
                {...register(`alternateNames.${i}`)}
              />
              <DestructiveButton
                type="button"
                onClick={() =>
                  setNumberOfAlternateNames((oldValue) =>
                    Math.max(1, oldValue - 1)
                  )
                }
              >
                <HiMiniMinusCircle />
              </DestructiveButton>
            </>
          ))}
          <div className="col-start-2 text-2xl">
            <PrimaryButton
              type="button"
              onClick={() =>
                setNumberOfAlternateNames((oldValue) => oldValue + 1)
              }
            >
              <HiMiniPlusCircle />
            </PrimaryButton>
          </div>
        </div>
        <Textarea
          labelText="Description"
          {...register("description")}
          errorMessage={errors.description?.message}
        />
        <PrimaryButton className="col-start-2">Save Changes</PrimaryButton>
      </Form>
    </>
  );
}
