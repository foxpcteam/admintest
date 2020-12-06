import React, { useState, useRef, useEffect } from "react"
import { Text, Flex, Box, Image } from "rebass"
import { navigate } from "gatsby"
import ReactJson from "react-json-view"
import styled from "@emotion/styled"
import MultiSelect from "react-multi-select-component"
import _ from "lodash"

import Card from "../../../components/card"
import Spinner from "../../../components/spinner"
import Badge from "../../../components/badge"
import Button from "../../../components/button"
import EditableInput from "../../../components/editable-input"

import useMedusa from "../../../hooks/use-medusa"
import DiscountRuleModal from "./discount-rule"
import { Input } from "@rebass/forms"
import Typography from "../../../components/typography"

const ProductLink = styled(Text)`
  color: #006fbb;
  z-index: 1000;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  `

const StyledMultiSelect = styled(MultiSelect)`
  ${Typography.Base}

  color: black;
  background-color: white;

  max-width: 400px;
  text-overflow: ellipsis;

  min-width: 200px;

  line-height: 1.5;
  margin-top: 8px;
  border: none;
  outline: 0;

  transition: all 0.2s ease;

  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(60, 66, 87, 0.16) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px;

  &:focus: {
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(206, 208, 190, 0.36) 0px 0px 0px 4px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(60, 66, 87, 0.16) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px;
  }
  &::placeholder: {
    color: #a3acb9;
  }

  .go3433208811 {
    border: none;
    border-radius: 3px;
  }
`

const Divider = props => (
  <Box
    {...props}
    as="hr"
    m={props.m}
    sx={{
      bg: "#e3e8ee",
      border: 0,
      height: 1,
    }}
  />
)

const DiscountDetails = ({ id }) => {
  const [selectedProducts, setSelectedProducts] = useState(
    discount && discount.discount_rule ? discount.discount_rule.valid_for : []
  )
  const [updating, setUpdating] = useState(false)
  const [showRuleEdit, setShowRuleEdit] = useState(false)
  const [code, setCode] = useState(discount && discount.code)

  const [selectedRegions, setSelectedRegions] = useState([])

  const discountCodeRef = useRef()

  const { discount, update, refresh, isLoading, toaster } = useMedusa(
    "discounts",
    {
      id,
    }
  )
  const { products, isLoading: isLoadingProducts } = useMedusa("products")
  const { regions } = useMedusa("regions")

  useEffect(() => {
    if (discount) {
      setCode(discount.code)
    }
  }, [discount])

  useEffect(() => {
    if (regions && discount && discount.regions) {
      const temp = regions.reduce((acc, next) => {
        if (discount.regions.includes(next._id)) {
          acc.push({ label: next.name, value: next._id })
        }
        return acc
      }, [])
      setSelectedRegions(temp)
    }
  }, [regions, discount])

  if (isLoading || updating || !discount || !regions) {
    return (
      <Flex flexDirection="column" alignItems="center" height="100vh" mt="auto">
        <Box height="75px" width="75px" mt="50%">
          <Spinner dark />
        </Box>
      </Flex>
    )
  }

  const onTitleBlur = () => {
    if (discount.code === code) return

    update({
      code: code,
    })
      .then(() => {
        refresh({ id })
        setUpdating(false)
        toaster("Discount updated", "success")
      })
      .catch(() => {
        setUpdating(false)
        toaster("Discount update failed", "error")
      })
  }

  const handleDisabled = () => {
    setUpdating(true)
    update({
      disabled: discount.disabled ? false : true,
    })
      .then(() => {
        refresh({ id })
        setUpdating(false)
        toaster("Discount updated", "success")
      })
      .catch(() => {
        setUpdating(false)
        toaster("Discount update failed", "error")
      })
  }

  const handleDiscountRuleUpdate = data => {
    setUpdating(true)
    update({
      discount_rule: data,
    })
      .then(() => {
        refresh({ id })
        setUpdating(false)
        setShowRuleEdit(false)
        toaster("Discount rule updated", "success")
      })
      .catch(() => {
        setUpdating(false)
        setShowRuleEdit(false)
        toaster("Discount rule update failed", "error")
      })
  }

  const handleRegionUpdate = data => {
    const toUpdateWith = regions.reduce((acc, next) => {
      if (data.map(el => el.value).includes(next._id)) {
        acc.push(next._id)
      }
      return acc
    }, [])

    setUpdating(true)
    update({
      regions: toUpdateWith,
    })
      .then(() => {
        refresh({ id })
        setUpdating(false)
        toaster("Discount updated", "success")
      })
      .catch(() => {
        setUpdating(false)
        toaster("Discount update failed", "error")
      })
  }

  return (
    <Flex flexDirection="column" mb={5}>
      <Card mb={2}>
        <Card.Header
          action={{
            label: discount.disabled ? "Enable" : "Disable",
            onClick: () => handleDisabled(),
          }}
        >
          {discount._id}
        </Card.Header>
        <Box>
          {code && (
            <EditableInput
              text={code}
              childRef={discountCodeRef}
              type="input"
              style={{ maxWidth: "400px" }}
              onBlur={onTitleBlur}
            >
              <Input
                m={3}
                ref={discountCodeRef}
                type="text"
                name="code"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </EditableInput>
          )}
          {/* <Text p={3} fontWeight="bold">
            {discount.code}
          </Text> */}
        </Box>
        <Card.Body>
          <Box pl={3} pr={2}>
            <Text pb={1} color="gray">
              Disabled
            </Text>
            <Text pt={1} width="100%" textAlign="center" mt={2}>
              <Badge width="100%" color="#4f566b" bg="#e3e8ee">
                {`${discount.disabled}`}
              </Badge>
            </Text>
          </Box>
          <Card.VerticalDivider mx={3} />
          <Box pl={3} pr={2}>
            <Text pb={1} color="gray">
              Valid regions
            </Text>
            <StyledMultiSelect
              options={
                regions &&
                regions.map(el => ({
                  label: el.name,
                  value: el._id,
                }))
              }
              selectAllLabel={"All"}
              overrideStrings={{
                allItemsAreSelected: "All regions",
              }}
              value={selectedRegions}
              onChange={setSelectedRegions}
            />
          </Box>
          <Card.VerticalDivider mx={3} />
          <Box ml="auto" />
          <Flex mr={3} mt="auto">
            <Button
              disabled={_.isEqual(
                selectedRegions.map(el => el.value),
                discount.regions
              )}
              variant="primary"
              onClick={() => handleRegionUpdate(selectedRegions)}
            >
              Save valid regions
            </Button>
          </Flex>
        </Card.Body>
      </Card>
      <Card mb={2}>
        <Card.Header
          action={{
            label: "Edit",
            type: "primary",
            onClick: () => setShowRuleEdit(true),
          }}
        >
          Discount rule
        </Card.Header>
        <Card.Body flexDirection="column">
          <Box display="flex" flexDirection="row">
            <Box pl={3} pr={5}>
              <Text color="gray">Description</Text>
              <Text pt={1} color="gray">
                Type
              </Text>
              <Text pt={1} color="gray">
                Value
              </Text>
              <Text pt={1} color="gray">
                Allocation method
              </Text>
            </Box>
            <Box px={3}>
              <Text>{discount.discount_rule.description}</Text>
              <Text pt={1}>{discount.discount_rule.type}</Text>
              <Text pt={1}>{discount.discount_rule.value}</Text>
              <Text pt={1}>{discount.discount_rule.allocation}</Text>
            </Box>
          </Box>
          <Divider m={3} />
          <Box>
            <Text ml={3} mb={2}>
              Applicable product(s)
            </Text>
            {discount.discount_rule.valid_for.map(product => (
              <Box
                key={product._id}
                pl={3}
                pr={2}
                py={2}
                display="flex"
                alignItems="center"
              >
                <Image
                  ml={3}
                  src={product.thumbnail || ""}
                  sx={{
                    objectFit: "contain",
                    width: 35,
                    height: 35,
                  }}
                />
                <Card.VerticalDivider mx={3} height="35px" />
                <ProductLink
                  onClick={() => navigate(`/a/products/${product._id}`)}
                >
                  {product.title}
                </ProductLink>
                <Card.VerticalDivider mx={3} height="35px" />
                <Text>{product.variants.length} variant(s)</Text>
              </Box>
            ))}
          </Box>
        </Card.Body>
      </Card>
      <Card mr={3} width="100%">
        <Card.Header>Raw discount</Card.Header>
        <Card.Body>
          <ReactJson
            name={false}
            collapsed={true}
            src={discount}
            style={{ marginLeft: "20px" }}
          />
        </Card.Body>
      </Card>
      {showRuleEdit && (
        <DiscountRuleModal
          discount={discount}
          onUpdate={handleDiscountRuleUpdate}
          onDismiss={() => setShowRuleEdit(false)}
          products={products}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      )}
    </Flex>
  )
}

export default DiscountDetails